import {
  Box,
  Button,
  Chip,
  CircularProgress,
  TextField,
  Typography,
  Autocomplete,
} from "@mui/material";
import { Form, Formik, type FormikHelpers } from "formik";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from "react";
import * as Yup from "yup";
import { MdCloudUpload } from "react-icons/md";
import FormTextField from "../forms/shared/FormTextField";
import SnackBar from "../snackBar/SnackBar";
import {
  checkCategoryExists,
  createCategory,
  createReport,
  getCategories,
  uploadMedia,
} from "../../services";
import styles from "./ReportForm.module.css";

const OTHER_OPTION = { id: "other" as const, name: "+ Add new category" };

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

const validationSchema = Yup.object({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title must be at most 150 characters")
    .required("Title is required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .required("Description is required"),
  locationText: Yup.string().required("Location is required"),
  newCategoryName: Yup.string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name must be at most 50 characters"),
});

export default function ReportForm() {
  const [medias, setMedias] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<CategoryOption[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [newCategoryError, setNewCategoryError] = useState("");
  const [categoryInput, setCategoryInput] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
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

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const mutation = useMutation({
    mutationFn: async (values: ReportFormValues) => {
      if (selectedCategories.length === 0 && !showNewCategory) {
        setCategoryError("Please select at least one category or create a new one.");
        throw new Error("Category selection is required.");
      }

      const trimmedNewCategory = values.newCategoryName.trim();
      if (showNewCategory && trimmedNewCategory.length < 2) {
        setNewCategoryError("Please enter a valid new category name.");
        throw new Error("New category name is invalid.");
      }

      let finalCategoryIds = selectedCategories
        .map((category) => Number(category.id))
        .filter((id) => Number.isFinite(id));

      if (showNewCategory) {
        const categoryExists = await checkCategoryExists(trimmedNewCategory);
        if (categoryExists) {
          setNewCategoryError(
            "This category already exists. Please select it from the list.",
          );
          throw new Error("Category already exists.");
        }

        const createdCategory = (await createCategory(trimmedNewCategory)) as {
          id?: number;
        };

        if (typeof createdCategory.id !== "number") {
          throw new Error("Category creation failed.");
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
        throw new Error("Report creation failed.");
      }

      await Promise.all(medias.map((file) => uploadMedia(report.id as number, file)));
      return report;
    },
    onSuccess: (_, __, ___, context) => {
      void context;
      setMessage("Report created successfully!");
      setIsError(false);
      setMedias([]);
      setSelectedCategories([]);
      setShowNewCategory(false);
      setNewCategoryError("");
      setCategoryError("");
      setCategoryInput("");
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : "Error creating report. Please try again.";

      const isValidationMessage =
        errorMessage === "Category selection is required." ||
        errorMessage === "New category name is invalid." ||
        errorMessage === "Category already exists.";

      if (!isValidationMessage) {
        setMessage(errorMessage);
        setIsError(true);
      }
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
    const trimmedName = name.trim();
    if (!showNewCategory || trimmedName.length < 2) {
      return;
    }

    const exists = await checkCategoryExists(trimmedName);
    if (exists) {
      setNewCategoryError(
        "This category already exists. Please select it from the list.",
      );
      return;
    }

    setNewCategoryError("");
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
          Describe the issue you observed in your area. {" "}
          <span style={{ color: "#e53935" }}>*</span> Required fields
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

            if (selectedOther.name.startsWith('+ Add "')) {
              const extractedName = selectedOther.name
                .replace('+ Add "', "")
                .replace('" as new category', "");
              void setFieldValue("newCategoryName", extractedName);
              setCategoryInput(extractedName);
            }
          };

          return (
            <Form>
              <div className={styles.formInputs}>
                <FormTextField
                  label="Title *"
                  name="title"
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.title && errors.title)}
                  helperText={touched.title && errors.title}
                />

                <FormTextField
                  label="Description *"
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
                  label="Location *"
                  name="locationText"
                  value={values.locationText}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.locationText && errors.locationText)}
                  helperText={touched.locationText && errors.locationText}
                />

                <Box display="flex" flexDirection="column" gap={1}>
                  <Autocomplete
                    multiple
                    options={[...categoryOptions, OTHER_OPTION]}
                    value={allSelected}
                    inputValue={categoryInput}
                    onInputChange={(_, value) => setCategoryInput(value)}
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
                            name: `+ Add "${input}" as new category`,
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
                        label="Categories *"
                        error={Boolean(categoryError)}
                        helperText={categoryError || "Select one or more categories."}
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

                  {selectedCategories.length > 0 && (
                    <Box className={styles.selectedCategories}>
                      <Typography variant="caption" color="#666">
                        Selected categories
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {selectedCategories.map((category) => (
                          <Chip
                            key={String(category.id)}
                            label={category.name}
                            onDelete={() => {
                              setSelectedCategories((current) =>
                                current.filter((item) => item.id !== category.id),
                              );
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>

                {showNewCategory && (
                  <Box display="flex" gap={1} alignItems="flex-start">
                    <Box flex={1}>
                      <FormTextField
                        label="New category name *"
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
                        error={Boolean(newCategoryError || (touched.newCategoryName && errors.newCategoryName))}
                        helperText={
                          newCategoryError ||
                          (touched.newCategoryName && errors.newCategoryName)
                        }
                      />
                    </Box>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowNewCategory(false);
                        setNewCategoryError("");
                        setCategoryInput("");
                        void setFieldValue("newCategoryName", "");
                      }}
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
                    Attach photos or videos {" "}
                    <span style={{ color: "#999", fontSize: 12 }}>(optional)</span>
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
                      Click to select files
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
                  disabled={mutation.isPending || isSubmitting || Boolean(newCategoryError)}
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
                    "Submit Report"
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
