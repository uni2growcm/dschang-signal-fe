import { MdOutlineWifiTethering } from "react-icons/md";
import { Link } from "react-router";
import { PATHS } from "../../routes/PATHS";
import { useTranslation } from "react-i18next";

export default function Logo({
  hideText = false,
  className = "",
  col,
  textStyle = "",
}: Readonly<{
  hideText?: boolean;
  className?: string;
  col?: boolean;
  textStyle?: string;
}>) {
  const { t } = useTranslation();
  return (
    <Link
      to={PATHS.INDEX}
      className={`flex items-center gap-3 z-50 ${className} ${col && "max-sm:flex-col max-sm:w-full max-sm:justify-center"}`}
    >
      <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl">
        <MdOutlineWifiTethering size={32} className={`text-white`} />
      </div>
      {!hideText && (
        <span
          className={`text-2xl max-lg:text-lg font-bold tracking-wide max-sm:hidden ${hideText ? "hidden" : ""} max-sm:text-inherit sm:text-white ${textStyle}`}
        >
          {t("common.appName")}
        </span>
      )}
      {col && (
        <span
          className={`sm:hidden max-sm:text-2xl max-lg:text-xl font-bold tracking-wide max-sm:text-black sm:text-white`}
        >
          {t("common.appName")}
        </span>
      )}
    </Link>
  );
}
