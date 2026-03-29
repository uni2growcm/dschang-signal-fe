import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Form, Formik, type FormikHelpers } from "formik";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { MdCloudUpload } from "react-icons/md";
import { useNavigate } from "react-router";
import * as Yup from "yup";
import { useNotificationCenter } from "../../contexts/NotificationCenter";
import { PATHS } from "../../routes/PATHS";
import {
  checkCategoryExists,
  createCategory,
  createReport,
  getDailyReportQuota,
  getCategories,
  uploadMedia,
} from "../../services";
import FormTextField from "../forms/shared/FormTextField";
import SnackBar from "../snackBar/SnackBar";
import styles from "./ReportForm.module.css";

interface CategoryOption {
  id: number | string;
  name: string;
}

interface ReportFormValues {
  title: string;
  description: string;
  locationText: string;
  newCategoryName: string;
}

const initialValues: ReportFormValues = {
  title: "",
  description: "",
  locationText: "",
  newCategoryName: "",
};

export default function ReportForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationCenter();
  const [medias, setMedias] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<CategoryOption[]>(
    [],
  );
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [newCategoryError, setNewCategoryError] = useState("");

  const OTHER_OPTION = {
    id: "other" as const,
    name: t("reportForm.addCategory"),
  };

  const validationSchema = Yup.object({
    title: Yup.string()
      .min(3, t("reportForm.titleMin"))
      .max(150, t("reportForm.titleMax"))
      .required(t("reportForm.titleRequired")),
    description: Yup.string()
      .min(10, t("reportForm.descriptionMin"))
      .required(t("reportForm.descriptionRequired")),
    locationText: Yup.string().required(t("reportForm.locationRequired")),
    newCategoryName: Yup.string()
      .trim()
      .min(2, t("reportForm.categoryNameMin"))
      .max(50, t("reportForm.categoryNameMax")),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const { data: dailyQuota, isLoading: isQuotaLoading } = useQuery({
    queryKey: ["daily-report-quota"],
    queryFn: getDailyReportQuota,
    retry: false,
  });

  const categoryOptions = useMemo<CategoryOption[]>(() => {
    return (categories as Array<{ id: number | string; name: string }>).map(
      (category) => ({ id: category.id, name: category.name }),
    );
  }, [categories]);

  const previewUrls = useMemo(
    () => medias.map((file) => URL.createObjectURL(file)),
    [medias],
  );
  const isQuotaReached =
    dailyQuota?.hasRecognizedFields === true &&
    dailyQuota.dailyLimit !== 0 &&
    dailyQuota.remainingToday !== null &&
    dailyQuota.remainingToday <= 0;
  const shouldShowQuota = dailyQuota?.hasRecognizedFields === true;

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  useEffect(() => {
    if (!isQuotaReached) {
      return;
    }

    addNotification({
      title: t("reportForm.notifications.dailyLimitReachedTitle"),
      message: t("reportForm.notifications.dailyLimitReachedMessage"),
      type: "warning",
    });
  }, [addNotification, isQuotaReached, t]);

  const mutation = useMutation({
    mutationFn: async (values: ReportFormValues) => {
      let finalCategoryIds = selectedCategories
        .map((category) => Number(category.id))
        .filter((id) => Number.isFinite(id));

      if (showNewCategory) {
        const trimmedCategoryName = values.newCategoryName.trim();

        if (trimmedCategoryName.length < 2) {
          setNewCategoryError(t("reportForm.categoryNameMin"));
          throw new Error(t("reportForm.categoryNameMin"));
        }

        const exists = await checkCategoryExists(trimmedCategoryName);
        if (exists) {
          setNewCategoryError(t("reportForm.categoryExists"));
          throw new Error(t("reportForm.categoryExistsFull"));
        }

        const createdCategory = (await createCategory(trimmedCategoryName)) as {
          id?: number;
        };

        if (typeof createdCategory.id !== "number") {
          throw new Error(t("reportForm.error"));
        }

        finalCategoryIds = [...finalCategoryIds, createdCategory.id];
      }

      const report = (await createReport({
        title: values.title.trim(),
        description: values.description.trim(),
        locationText: values.locationText.trim(),
        categoryIds: finalCategoryIds,
      })) as { id?: number };

      if (typeof report.id !== "number") {
        throw new Error(t("reportForm.error"));
      }

      await Promise.all(medias.map((file) => uploadMedia(report.id as number, file)));

      return report;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["daily-report-quota"] });
      if (
        dailyQuota?.hasRecognizedFields === true &&
        dailyQuota.dailyLimit !== 0 &&
        dailyQuota.remainingToday !== null &&
        dailyQuota.remainingToday <= 1
      ) {
        addNotification({
          title: t("reportForm.notifications.dailyLimitReachedTitle"),
          message: t("reportForm.notifications.dailyLimitReachedMessage"),
          type: "warning",
        });
      }
      setMessage(t("reportForm.success"));
      setIsError(false);
      setMedias([]);
      setSelectedCategories([]);
      setShowNewCategory(false);
      setCategoryError("");
      setNewCategoryError("");
      navigate(PATHS.INDEX, {
        state: { filter: "mine" },
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error && error.message ? error.message : t("reportForm.error");

      const normalizedMessage = errorMessage.toLowerCase();
      if (
        normalizedMessage.includes("limit") ||
        normalizedMessage.includes("maximum number of reports") ||
        normalizedMessage.includes("limite") ||
        isQuotaReached
      ) {
        addNotification({
          title: t("reportForm.notifications.dailyLimitReachedTitle"),
          message: errorMessage,
          type: "warning",
        });
      }

      setMessage(errorMessage);
      setIsError(true);
    },
  });

  const handleMediaChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setMedias((current) => [...current, ...files]);
    event.target.value = "";
  };

  const removeMedia = (indexToRemove: number) => {
    setMedias((current) => current.filter((_, index) => index !== indexToRemove));
  };

  const handleNewCategoryBlur = async (name: string) => {
    if (!showNewCategory) {
      return;
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return;
    }

    try {
      const exists = await checkCategoryExists(trimmedName);
      if (exists) {
        setNewCategoryError(t("reportForm.categoryExists"));
        return;
      }
    } catch {
      return;
    }

    setNewCategoryError("");
  };

  const removeCategory = (
    id: number | string,
    setFieldValue: FormikHelpers<ReportFormValues>["setFieldValue"],
  ) => {
    if (id === "other") {
      setShowNewCategory(false);
      setNewCategoryError("");
      void setFieldValue("newCategoryName", "");
      return;
    }

    setSelectedCategories((current) =>
      current.filter((category) => category.id !== id),
    );
  };

  const resetToast = () => {
    setMessage("");
    setIsError(false);
  };

  const submitForm = async (
    values: ReportFormValues,
    helpers: FormikHelpers<ReportFormValues>,
  ) => {
    try {
      await mutation.mutateAsync(values);
      helpers.resetForm();
    } catch {
      return;
    }
  };

  return (
    <div className={styles.formWrapper}>
      <div className={styles.formHeader}>
        <Typography variant="body2" color="#666">
          {t("reportForm.headerDescription")}{" "}
          <span style={{ color: "#e53935" }}>{`*`}</span>{" "}
          {t("reportForm.requiredFields")}
        </Typography>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={submitForm}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          isSubmitting,
          setFieldValue,
        }) => {
          const allSelected = [
            ...selectedCategories,
            ...(showNewCategory ? [OTHER_OPTION] : []),
          ];

          const handleCategoryChange = (
            _: SyntheticEvent,
            newValue: CategoryOption[],
          ) => {
            const selectedOther = newValue.find((option) => option.id === "other");
            const withoutOther = newValue.filter((option) => option.id !== "other");

            setSelectedCategories(withoutOther);
            setCategoryError("");

            if (!selectedOther) {
              setShowNewCategory(false);
              setNewCategoryError("");
              void setFieldValue("newCategoryName", "");
              return;
            }

            setShowNewCategory(true);

            if (selectedOther.name.startsWith(t('reportForm.add'))) {
              const extractedName = selectedOther.name
                .replace(t('reportForm.add'), "")
                .replace(t('reportForm.as-new-category'), "");
              void setFieldValue("newCategoryName", extractedName);
            }
          };

          return (
            <Form>
              <div className={styles.formInputs}>
                {shouldShowQuota && (
                  <Box className={styles.quotaCard}>
                    <Typography variant="subtitle2" className={styles.quotaTitle}>
                      {t("reportForm.quota.title")}
                    </Typography>
                    <Box className={styles.quotaStats}>
                      <Box className={styles.quotaStat}>
                        <Typography variant="caption" color="#666">
                          {t("reportForm.quota.createdToday")}
                        </Typography>
                        <Typography variant="h6">
                          {dailyQuota.createdToday ?? 0}
                        </Typography>
                      </Box>
                      <Box className={styles.quotaStat}>
                        <Typography variant="caption" color="#666">
                          {t("reportForm.quota.remainingToday")}
                        </Typography>
                        <Typography
                          variant="h6"
                          color={isQuotaReached ? "#d32f2f" : "#2e7d32"}
                        >
                          {dailyQuota.dailyLimit === 0
                            ? t("reportForm.quota.unlimited")
                            : (dailyQuota.remainingToday ?? "-")}
                        </Typography>
                      </Box>
                    </Box>
                    {isQuotaReached && (
                      <Typography variant="body2" color="#d32f2f">
                        {t("reportForm.quota.reached")}
                      </Typography>
                    )}
                  </Box>
                )}

                <FormTextField
                  label={`${t("reportForm.title")}`}
                  required
                  name="title"
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.title && errors.title)}
                  helperText={touched.title && errors.title}
                />

                <FormTextField
                  label={`${t("reportForm.description")}`}
                  required
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.description && errors.description)}
                  helperText={touched.description && errors.description}
                  multiline
                  rows={4}
                />

                <FormTextField
                  label={`${t("reportForm.location")}`}
                  name="locationText"
                  value={values.locationText}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.locationText && errors.locationText)}
                  helperText={touched.locationText && errors.locationText}
                />

                {allSelected.length > 0 && (
                  <div className={styles.selectedCategories}>
                    <Typography variant="caption" color="#999">
                      {t("reportForm.selectedCategories")}
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                      {allSelected.map((category) => (
                        <Chip
                          key={String(category.id)}
                          label={
                            category.id === "other"
                              ? values.newCategoryName || t("reportForm.addCategory")
                              : category.name
                          }
                          size="small"
                          onDelete={() => removeCategory(category.id, setFieldValue)}
                          sx={{
                            backgroundColor: "#f5f5f5",
                            color: "#555",
                            border: "1px solid #e0e0e0",
                            "& .MuiChip-deleteIcon": {
                              color: "#bbb",
                              "&:hover": { color: "#888" },
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </div>
                )}

                <Autocomplete
                  multiple
                  options={[...categoryOptions, OTHER_OPTION]}
                  value={allSelected}
                  onChange={handleCategoryChange}
                  disableCloseOnSelect
                  renderTags={() => null}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  filterOptions={(options, params) => {
                    const input = params.inputValue.trim();
                    const normalizedInput = input.toLowerCase();
                    const filtered = options.filter(
                      (option) =>
                        option.id !== "other" &&
                        option.name.toLowerCase().includes(normalizedInput),
                    );

                    if (
                      input.length > 0 &&
                      !categoryOptions.some(
                        (category) => category.name.toLowerCase() === normalizedInput,
                      )
                    ) {
                      return [
                        ...filtered,
                        {
                          id: "other",
                          name: t('reportForm.add-input-as-new-category', {value: input}),
                        },
                      ];
                    }

                    return [...filtered, OTHER_OPTION];
                  }}
                  renderOption={(props, option) => {
                    const { key, ...optionProps } = props;
                    return (
                      <li
                        {...optionProps}
                        key={key}
                        style={{
                          color: option.id === "other" ? "#7c4dff" : "inherit",
                          fontStyle: option.id === "other" ? "italic" : "normal",
                        }}
                      >
                        {option.name}
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("reportForm.categoryOptional")}
                      error={Boolean(categoryError)}
                      helperText={categoryError}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          "&.Mui-focused fieldset": {
                            borderColor: "#7c4dff",
                          },
                        },
                      }}
                    />
                  )}
                />

                {showNewCategory && (
                  <Box display="flex" gap={1} alignItems="flex-start">
                    <Box flex={1}>
                      <FormTextField
                        required
                        label={`${t("reportForm.newCategory")}`}
                        name="newCategoryName"
                        value={values.newCategoryName}
                        onChange={(event) => {
                          setNewCategoryError("");
                          handleChange(event);
                        }}
                        onBlur={async (event) => {
                          handleBlur(event);
                          await handleNewCategoryBlur(event.target.value);
                        }}
                        error={Boolean(
                          newCategoryError ||
                            (touched.newCategoryName && errors.newCategoryName),
                        )}
                        helperText={
                          newCategoryError ||
                          (touched.newCategoryName && errors.newCategoryName)
                        }
                      />
                    </Box>
                    <Button
                      type="button"
                      onClick={() => removeCategory("other", setFieldValue)}
                      sx={{
                        mt: 0.5,
                        minWidth: 0,
                        color: "#999",
                        "&:hover": { color: "#e53935" },
                      }}
                    >
                      x
                    </Button>
                  </Box>
                )}

                <Box>
                  <Typography variant="body2" color="#666" mb={1}>
                    {t("reportForm.attachMedia")}{" "}
                    <span style={{ color: "#999", fontSize: 12 }}>
                      {`${t("reportForm.optional")}`}
                    </span>
                  </Typography>
                  <label className={styles.uploadZone}>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleMediaChange}
                      style={{ display: "none" }}
                    />
                    <MdCloudUpload size={28} color="#7c4dff" />
                    <Typography variant="body2" color="#7c4dff" mt={0.5}>
                      {t("reportForm.selectFiles")}
                    </Typography>
                  </label>
                </Box>

                {medias.length > 0 && (
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {medias.map((file, index) => (
                      <Box key={`${file.name}-${index}`} position="relative">
                        {file.type.startsWith("image/") ? (
                          <img
                            src={previewUrls[index]}
                            alt={file.name}
                            className={styles.previewImage}
                          />
                        ) : (
                          <Box className={styles.previewFile}>
                            <Typography variant="caption" noWrap>
                              {file.name}
                            </Typography>
                          </Box>
                        )}
                        <Chip
                          label="x"
                          size="small"
                          onClick={() => removeMedia(index)}
                          className={styles.removeChip}
                        />
                      </Box>
                    ))}
                  </Box>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  disabled={
                    mutation.isPending ||
                    isSubmitting ||
                    isQuotaLoading ||
                    isQuotaReached ||
                    Boolean(newCategoryError)
                  }
                  fullWidth
                  sx={{
                    backgroundColor: "#7c4dff",
                    borderRadius: "8px",
                    padding: "12px",
                    fontWeight: 600,
                    "&:hover": { backgroundColor: "#6b3edb" },
                  }}
                >
                  {mutation.isPending ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    t("reportForm.submit")
                  )}
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>

      <SnackBar
        open={Boolean(message)}
        message={message}
        severity={isError ? "error" : "success"}
        position="bottom-right"
        onClose={resetToast}
      />
    </div>
  );
}
