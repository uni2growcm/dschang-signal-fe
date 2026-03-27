import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import {
  useMutation,
  useQuery,
  useQuery as useQueryCategories,
  useQueryClient,
} from "@tanstack/react-query";
import { Form, Formik } from "formik";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MdCloudUpload } from "react-icons/md";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import * as Yup from "yup";
import FormTextField from "../../components/forms/shared/FormTextField";
import SnackBar from "../../components/snackBar/SnackBar";
import { PATHS } from "../../routes/PATHS";
import {
  deleteMedia,
  getCategories,
  getReportById,
  updateReport,
  uploadMedia,
} from "../../services";
import { useMe } from "../../services/user";
import styles from "./CreateReportPage.module.css";

interface CategoryOption {
  id: number | string;
  name: string;
}

export default function EditReportPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const validationSchema = Yup.object({
    title: Yup.string()
      .min(3, t("reportForm.titleMin"))
      .max(150, t("reportForm.titleMax"))
      .required(t("reportForm.titleRequired")),
    description: Yup.string()
      .min(10, t("reportForm.descriptionMin"))
      .required(t("reportForm.descriptionRequired")),
    locationText: Yup.string().required(t("reportForm.locationRequired")),
  });

  const {
    data: report,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["report", id],
    queryFn: () => getReportById(Number(id)),
    enabled: !!id,
  });

  const { data: currentUser } = useMe();

  const { data: allCategories = [] } = useQueryCategories({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const categoryOptions: CategoryOption[] = (allCategories as any[]).map(
    (cat: any) => ({ id: cat.id, name: cat.name }),
  );

  const [selectedCategories, setSelectedCategories] = useState<
    CategoryOption[]
  >(
    () =>
      report?.categories?.map((c: any) => ({ id: c.id, name: c.name })) ?? [],
  );

  const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);
  const [newMediaPreviews, setNewMediaPreviews] = useState<string[]>([]);
  const [deletingMediaId, setDeletingMediaId] = useState<number | null>(null);

  const isOwner = currentUser?.id === report?.createdBy?.id;
  const canEdit =
    isOwner &&
    report?.moderationStatus === "PENDING_REVIEW" &&
    report?.reportStatus === "PENDING";

  const deleteMediaMutation = useMutation({
    mutationFn: (mediaId: number) => deleteMedia(mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report", id] });
      setDeletingMediaId(null);
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: {
      title: string;
      description: string;
      locationText: string;
    }) => {
      await updateReport(Number(id), {
        ...values,
        categoryIds: selectedCategories.map((c) => Number(c.id)),
      });

      for (const file of newMediaFiles) {
        await uploadMedia(Number(id), file);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report", id] });
      queryClient.invalidateQueries({
        queryKey: ["getAuthenticatedUserReports"],
      });
      navigate(PATHS.REPORT_DETAILS.replace(":id", String(id)));
    },
  });

  const handleNewMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const previews = files.map((f) => URL.createObjectURL(f));
    setNewMediaFiles((prev) => [...prev, ...files]);
    setNewMediaPreviews((prev) => [...prev, ...previews]);
    e.target.value = "";
  };

  const removeNewMedia = (index: number) => {
    setNewMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setNewMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className="flex justify-center items-center flex-1 mt-20">
          <CircularProgress />
        </div>
      </div>
    );
  }

  if (isError || !report) return <Navigate to="/not-found" replace />;
  if (!canEdit)
    return (
      <Navigate to={PATHS.REPORT_DETAILS.replace(":id", String(id))} replace />
    );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <Link
          to={PATHS.REPORT_DETAILS.replace(":id", String(id))}
          className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:opacity-90 transition-all w-fit"
        >
          {t('editReport.back-to-report')}
        </Link>

        <div className={styles.pageHeader}>
          <Typography
            sx={{
              fontSize: 28,
              fontWeight: 700,
              color: "#1a1a2e",
              textAlign: "center",
            }}
          >
            {t('editReport.title')}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#666", mt: 0.5, textAlign: "center" }}
          >
            {t('editReport.update-details')}
          </Typography>
        </div>

        <Formik
          initialValues={{
            title: report.title ?? "",
            description: report.description ?? "",
            locationText: report.locationText ?? "",
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => mutation.mutate(values)}
        >
          {({ values, handleChange, handleBlur, errors, touched }) => (
            <Form className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-md">
              <FormTextField
                label={t('editReport.report-title')}
                required
                name="title"
                value={values.title}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.title && Boolean(errors.title)}
                helperText={touched.title && errors.title}
              />
              <FormTextField
                label={t('editReport.description')}
                name="description"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.description && Boolean(errors.description)}
                helperText={touched.description && errors.description}
                multiline
                rows={4}
              />
              <FormTextField
                label={t('editReport.location')}
                required
                name="locationText"
                value={values.locationText}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.locationText && Boolean(errors.locationText)}
                helperText={touched.locationText && errors.locationText}
              />

              <Autocomplete
                multiple
                options={categoryOptions}
                getOptionLabel={(option) => option.name}
                value={selectedCategories}
                onChange={(_, newValue) => setSelectedCategories(newValue)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.name}
                      size="small"
                      {...getTagProps({ index })}
                      key={option.id}
                      sx={{
                        backgroundColor: "#f3eeff",
                        color: "#7c4dff",
                        border: "1px solid #e0d7ff",
                      }}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('editReport.categories-optional')}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        "&.Mui-focused fieldset": { borderColor: "#7c4dff" },
                      },
                    }}
                  />
                )}
              />

              {report.medias?.length > 0 && (
                <Box>
                  <Typography variant="body2" color="#666" mb={1}>
                    {t('editReport.existing-media')}
                    <span style={{ color: "#999", fontSize: 12 }}>
                      {" "}
                      {t('editReport.click-to-remove')}
                    </span>
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {report.medias.map((media: any) => {
                      const fullUrl = `http://localhost:8080${media.url}`;
                      return (
                        <Box key={media.id} position="relative">
                          {media.mimeType?.startsWith("image") ? (
                            <img
                              src={fullUrl}
                              alt="media"
                              style={{
                                width: 100,
                                height: 100,
                                objectFit: "cover",
                                borderRadius: 8,
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 100,
                                height: 100,
                                borderRadius: 1,
                                bgcolor: "#f3eeff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 12,
                                color: "#7c4dff",
                                p: 1,
                                textAlign: "center",
                              }}
                            >
                              📄 {media.originalName ?? "file"}
                            </Box>
                          )}
                          <Chip
                            label={deletingMediaId === media.id ? "..." : "✕"}
                            size="small"
                            onClick={() => {
                              setDeletingMediaId(media.id);
                              deleteMediaMutation.mutate(media.id);
                            }}
                            sx={{
                              position: "absolute",
                              top: -8,
                              right: -8,
                              cursor: "pointer",
                              backgroundColor: "#e53935",
                              color: "white",
                              fontWeight: 700,
                              "& .MuiChip-label": { px: 1 },
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              <Box>
                <Typography variant="body2" color="#666" mb={1}>
                  {t('editReport.add-new-media')}
                  <span style={{ color: "#999", fontSize: 12 }}>
                    {" "}
                    {t('editReport.optional')}
                  </span>
                </Typography>
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px dashed #c0a9f5",
                    borderRadius: 8,
                    padding: "16px",
                    cursor: "pointer",
                    backgroundColor: "#faf7ff",
                  }}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleNewMediaChange}
                    style={{ display: "none" }}
                  />
                  <MdCloudUpload size={28} color="#7c4dff" />
                  <Typography variant="body2" color="#7c4dff" mt={0.5}>
                    {t('editReport.click-to-select-files')}
                  </Typography>
                </label>

                {newMediaPreviews.length > 0 && (
                  <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                    {newMediaFiles.map((file, i) => (
                      <Box key={i} position="relative">
                        {file.type.startsWith("image/") ? (
                          <img
                            src={newMediaPreviews[i]}
                            alt={file.name}
                            style={{
                              width: 100,
                              height: 100,
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 100,
                              height: 100,
                              borderRadius: 1,
                              bgcolor: "#f3eeff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              color: "#7c4dff",
                              p: 1,
                              textAlign: "center",
                            }}
                          >
                            📄 {file.name}
                          </Box>
                        )}
                        <Chip
                          label="✕"
                          size="small"
                          onClick={() => removeNewMedia(i)}
                          sx={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            cursor: "pointer",
                            backgroundColor: "#e53935",
                            color: "white",
                            fontWeight: 700,
                            "& .MuiChip-label": { px: 1 },
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

              {mutation.isError && (
                <p className="text-red-500 text-sm text-center">
                  {(mutation.error as Error)?.message ||
                    t('editReport.failed-to-update-report')}
                </p>
              )}

              <button
                type="submit"
                disabled={mutation.isPending}
                className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
              >
                {mutation.isPending ? "Saving..." : t('editReport.save-changes')}
              </button>
            </Form>
          )}
        </Formik>

        <SnackBar
          open={mutation.isSuccess}
          message={t('editReport.report-updated-successfully')}
          severity="success"
        />
      </div>
    </div>
  );
}
