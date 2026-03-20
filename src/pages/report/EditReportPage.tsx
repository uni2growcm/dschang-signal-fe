import { useParams, Navigate, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CircularProgress, Typography } from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Header from "../../components/header/Header";
import FormTextField from "../../components/forms/shared/FormTextField";
import SnackBar from "../../components/snackBar/SnackBar";
import { Link } from "react-router";
import { PATHS } from "../../routes/PATHS";
import { getReportById, updateReport } from "../../services";
import { useMe } from "../../services/user";
import styles from "./CreateReportPage.module.css";

const validationSchema = Yup.object({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title must be at most 150 characters")
    .required("Title is required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .required("Description is required"),
  locationText: Yup.string().required("Location is required"),
});

export default function EditReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ["report", id],
    queryFn: () => getReportById(Number(id)),
    enabled: !!id,
  });

  const { data: currentUser } = useMe();

  const isOwner = currentUser?.id === report?.createdBy?.id;
  const canEdit = isOwner
    && report?.moderationStatus === "PENDING_REVIEW"
    && report?.reportStatus === "PENDING";

  const mutation = useMutation({
    mutationFn: (values: { title: string; description: string; locationText: string }) =>
      updateReport(Number(id), {
        ...values,
        categoryIds: report?.categories?.map((c: any) => c.id) ?? [],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report", id] });
      queryClient.invalidateQueries({ queryKey: ["getAuthenticatedUserReports"] });
      navigate(PATHS.REPORT_DETAILS.replace(":id", String(id)));
    },
  });

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <Header />
        <div className="flex justify-center items-center flex-1 mt-20">
          <CircularProgress />
        </div>
      </div>
    );
  }

  if (isError || !report) return <Navigate to="/not-found" replace />;
  if (!canEdit) return <Navigate to={PATHS.REPORT_DETAILS.replace(":id", String(id))} replace />;

  return (
    <div className={styles.pageContainer}>
      <Header />
      <div className={styles.contentWrapper}>
        <Link
          to={PATHS.REPORT_DETAILS.replace(":id", String(id))}
          className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:opacity-90 transition-all w-fit"
        >
          ← Back to Report
        </Link>
        <div className={styles.pageHeader}>
          <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#1a1a2e", textAlign: "center" }}>
            Edit Report
          </Typography>
          <Typography variant="body2" sx={{ color: "#666", mt: 0.5, textAlign: "center" }}>
            Update your report details
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
                label="Title *"
                name="title"
                value={values.title}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.title && Boolean(errors.title)}
                helperText={touched.title && errors.title}
              />
              <FormTextField
                label="Description *"
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
                label="Location *"
                name="locationText"
                value={values.locationText}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.locationText && Boolean(errors.locationText)}
                helperText={touched.locationText && errors.locationText}
              />

              {mutation.isError && (
                <p className="text-red-500 text-sm text-center">
                  {(mutation.error as Error)?.message || "Failed to update report"}
                </p>
              )}

              <button
                type="submit"
                disabled={mutation.isPending}
                className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
              >
                {mutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </Form>
          )}
        </Formik>

        <SnackBar
          open={mutation.isSuccess}
          message="Report updated successfully!"
          severity="success"
        />
      </div>
    </div>
  );
}