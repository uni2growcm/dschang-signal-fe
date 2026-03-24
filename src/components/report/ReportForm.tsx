import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PATHS } from "../../routes/PATHS";
import * as Yup from "yup";
import {
  checkCategoryExists,
  createCategory,
  createReport,
  getCategories,
  uploadMedia,
} from "../../services";
import FormTextField from "../forms/shared/FormTextField";
import SnackBar from "../snackBar/SnackBar";
import styles from "./ReportForm.module.css";
import { MdCloudUpload } from "react-icons/md";
import { useNavigate } from "react-router";

// const OTHER_OPTION = { id: "other" as const, name: "+ Add new category" };

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

// const validationSchema = Yup.object({
//   title: Yup.string()
//     .min(3, "Title must be at least 3 characters")
//     .max(150, "Title must be at most 150 characters")
//     .required("Title is required"),
//   description: Yup.string()
//     .min(10, "Description must be at least 10 characters")
//     .required("Description is required"),

//   locationText: Yup.string().required("Location is required"),
//   newCategoryName: Yup.string()
//     .min(2, "Category name must be at least 2 characters")
//     .max(50, "Category name must be at most 50 characters"),
// });

export default function ReportForm() {
  const [medias, setMedias] = useState<File[]>([]);
  const [preview, setPreview] = useState<string[]>([]);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<
    CategoryOption[]
  >([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [newCategoryError, setNewCategoryError] = useState("");
  const { t } = useTranslation();

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
      .min(2, t("reportForm.categoryNameMin"))
      .max(50, t("reportForm.categoryNameMax")),
  });

  const navigate = useNavigate();
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const categoryOptions: CategoryOption[] = (categories as any[]).map(
    (cat: any) => ({ id: cat.id, name: cat.name }),
  );

  const allSelected = [
    ...selectedCategories,
    ...(showNewCategory ? [OTHER_OPTION] : []),
  ];

  const handleCategoryChange = (
    _: React.SyntheticEvent,
    newValue: CategoryOption[],
  ) => {
    const otherOption = newValue.find((v) => v.id === "other");
    const withoutOther = newValue.filter((v) => v.id !== "other");
    setSelectedCategories(withoutOther);

    if (otherOption) {
      setShowNewCategory(true);
      if (otherOption.name.startsWith('+ Add "')) {
        const extracted = otherOption.name
          .replace('+ Add "', "")
          .replace('" as new category', "");
        window.dispatchEvent(
          new CustomEvent("prefill-category", { detail: extracted }),
        );
      }
    } else {
      setShowNewCategory(false);
      setNewCategoryError("");
    }

    setCategoryError("");
  };

  const handleNewCategoryBlur = async (name: string) => {
    if (!name.trim() || name.trim().length < 2) return;
    try {
      const exists = await checkCategoryExists(name.trim());
      if (exists) {
        setNewCategoryError(t("reportForm.categoryExists"));
      } else {
        setNewCategoryError("");
      }
    } catch {
      // Silently ignore check errors
    }
  };

  const removeCategory = (id: number | string) => {
    if (id === "other") {
      setShowNewCategory(false);
      setNewCategoryError("");
    } else {
      setSelectedCategories((prev) => prev.filter((cat) => cat.id !== id));
    }
  };

  const mutation = useMutation({
    mutationFn: async (values: ReportFormValues) => {
      if (newCategoryError) {
        throw new Error(newCategoryError);
      }

      let finalCategoryIds: number[] = [];

      if (showNewCategory && values.newCategoryName.trim()) {
        try {
          const newCategory = await createCategory(values.newCategoryName);
          finalCategoryIds.push(newCategory.id);
        } catch {
          throw new Error(t("reportForm.categoryExistsFull"));
        }
      }

      const existingIds = selectedCategories
        .filter((cat) => cat.id !== "other")
        .map((cat) => Number(cat.id));
      finalCategoryIds = [...finalCategoryIds, ...existingIds];

      const report = await createReport({
        title: values.title,
        description: values.description,
        locationText: values.locationText,
        categoryIds: finalCategoryIds,
      });

      const reportId = report.id!;
      for (const file of medias) {
        await uploadMedia(reportId, file);
      }
      return report;
    },
    onSuccess: () => {
      setMessage(t("reportForm.success"));
      setIsError(false);
      setMedias([]);
      setPreview([]);
      setSelectedCategories([]);
      setShowNewCategory(false);
      setNewCategoryError("");
      navigate(PATHS.INDEX, {
        state: { filter: "mine" },
      });
    },
    onError: (error: any) => {
      setMessage(error?.message || t("reportForm.error"));
      setIsError(true);
    },
  });

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? []);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setMedias((prev) => [...prev, ...newFiles]);
    setPreview((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  };

  const removeMedia = (index: number) => {
    setMedias((prev) => prev.filter((_, i) => i !== index));
    setPreview((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.formWrapper}>
      <div className={styles.formHeader}>
        <Typography variant="body2" color="#666">
          {t("reportForm.headerDescription")}{" "}
          <span style={{ color: "#e53935" }}>*</span>{" "}
          {`${t("reportForm.requiredFields")} *`}
        </Typography>
      </div>

      <Formik
        initialValues={{
          title: "",
          description: "",
          locationText: "",
          newCategoryName: "",
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => mutation.mutate(values)}
      >
        {({
          values,
          handleChange,
          handleBlur,
          errors,
          touched,
          setFieldValue,
        }) => {
          useEffect(() => {
            const handler = (e: Event) => {
              setFieldValue("newCategoryName", (e as CustomEvent).detail);
            };
            window.addEventListener("prefill-category", handler);
            return () =>
              window.removeEventListener("prefill-category", handler);
          }, [setFieldValue]);

          return (
            <Form>
              <div className={styles.formInputs}>
                <FormTextField
                  label={`${t("reportForm.title")} *`}
                  name="title"
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.title && Boolean(errors.title)}
                  helperText={touched.title && errors.title}
                />

                <FormTextField
                  label={`${t("reportForm.description")} *`}
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
                  label={`${t("reportForm.location")} *`}
                  name="locationText"
                  value={values.locationText}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.locationText && Boolean(errors.locationText)}
                  helperText={touched.locationText && errors.locationText}
                />

                {allSelected.length > 0 && (
                  <div className={styles.selectedCategories}>
                    <Typography variant="caption" color="#999">
                      {t("reportForm.selectedCategories")}
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                      {allSelected.map((cat) => (
                        <Chip
                          key={cat.id}
                          label={
                            cat.id === "other"
                              ? values.newCategoryName || "+ Add new category"
                              : cat.name
                          }
                          size="small"
                          onDelete={() => removeCategory(cat.id)}
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
                  getOptionLabel={(option) => option.name}
                  value={allSelected}
                  onChange={handleCategoryChange}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  disableCloseOnSelect
                  renderTags={() => null}
                  componentsProps={{
                    popper: {
                      placement: "bottom",
                      modifiers: [{ name: "flip", enabled: false }],
                    },
                  }}
                  filterOptions={(options, { inputValue }) => {
                    const trimmed = inputValue.trim().toLowerCase();
                    const filtered = options.filter(
                      (opt) =>
                        opt.id !== "other" &&
                        opt.name.toLowerCase().includes(trimmed),
                    );
                    if (
                      trimmed.length > 0 &&
                      !categoryOptions.some(
                        (cat) => cat.name.toLowerCase() === trimmed,
                      )
                    ) {
                      return [
                        ...filtered,
                        {
                          id: "other",
                          name: `+ Add "${inputValue.trim()}" as new category`,
                        },
                      ];
                    }
                    return [...filtered, OTHER_OPTION];
                  }}
                  renderOption={(props, option) => (
                    <li
                      {...props}
                      key={String(option.id)}
                      style={{
                        color: option.id === "other" ? "#7c4dff" : "inherit",
                        fontStyle: option.id === "other" ? "italic" : "normal",
                      }}
                    >
                      {option.name}
                    </li>
                  )}
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
                        label={`${t("reportForm.newCategory")} *`}
                        name="newCategoryName"
                        value={values.newCategoryName}
                        onChange={handleChange}
                        onBlur={(e) => {
                          handleBlur(e);
                          handleNewCategoryBlur(e.target.value);
                        }}
                        error={Boolean(newCategoryError)}
                        helperText={
                          newCategoryError ||
                          (touched.newCategoryName && errors.newCategoryName)
                        }
                      />
                    </Box>
                    <Button
                      onClick={() => {
                        setShowNewCategory(false);
                        setNewCategoryError("");
                        setFieldValue("newCategoryName", "");
                      }}
                      sx={{
                        mt: 0.5,
                        minWidth: 0,
                        color: "#999",
                        "&:hover": { color: "#e53935" },
                      }}
                    >
                      ✕
                    </Button>
                  </Box>
                )}

                <Box>
                  <Typography variant="body2" color="#666" mb={1}>
                    {" "}
                    {t("reportForm.attachMedia")}{" "}
                    <span style={{ color: "#999", fontSize: 12 }}>
                      {" "}
                      ({t("reportForm.optional")})
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
                      {" "}
                      {t("reportForm.selectFiles")}
                    </Typography>
                  </label>
                </Box>

                {preview.length > 0 && (
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {medias.map((file, i) => (
                      <Box key={i} position="relative">
                        {file.type.startsWith("image/") ? (
                          <img
                            src={preview[i]}
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
                          label="×"
                          size="small"
                          onClick={() => removeMedia(i)}
                          className={styles.removeChip}
                        />
                      </Box>
                    ))}
                  </Box>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  disabled={mutation.isPending || Boolean(newCategoryError)}
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
        open={!!message}
        message={message}
        severity={isError ? "error" : "success"}
        position="bottom-right"
      />
    </div>
  );
}
