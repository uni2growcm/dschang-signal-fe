import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import DownloadIcon from "@mui/icons-material/Download";
import { useEffect, useRef, useState } from "react";
import { useMediaViewer } from "../../hooks/useMediaViewer";
import styles from "./MediaViewer.module.css";
import { useTranslation } from "react-i18next";
import { FaPlay } from "react-icons/fa6";

interface MediaViewerProps {
  viewer: ReturnType<typeof useMediaViewer>;
}

export default function MediaViewer({ viewer }: MediaViewerProps) {
  const { t } = useTranslation();

  const {
    isOpen,
    currentMedia,
    closeViewer,
    nextMedia,
    previousMedia,
    hasNext,
    hasPrevious,
  } = viewer;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");

  useEffect(() => {
    if (!isOpen) {
      setVideoUrl("");
    }
  }, [isOpen]);

  const handlePlayClick = () => {
    if (currentMedia && !videoUrl) {
      setVideoUrl(currentMedia.url);
    }
  };

  if (!currentMedia) return null;

  const getMediaType = (
    mimeType: string,
  ): "image" | "video" | "audio" | "document" => {
    if (mimeType?.startsWith("image/")) return "image";
    if (mimeType?.startsWith("video/")) return "video";
    if (mimeType?.startsWith("audio/")) return "audio";
    return "document";
  };

  const mediaType = getMediaType(currentMedia.mimeType);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = currentMedia.url;
    link.download = currentMedia.fileName || `media-${currentMedia.id}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderMediaContent = () => {
    switch (mediaType) {
      case "image":
        return (
          <img
            src={currentMedia.url}
            alt={`Media ${currentMedia.id}`}
            className={styles.fullImage}
          />
        );
      case "video":
        if (!videoUrl) {
          return (
            <Box className={styles.videoPlaceholder}>
              <button onClick={handlePlayClick} className={styles.playButton}>
                <FaPlay />
              </button>
              <Typography className={styles.playHint}>
                {t("media.play-video")}
              </Typography>
            </Box>
          );
        }

        return (
          <video
            ref={videoRef}
            controls
            autoPlay={true}
            className={styles.fullVideo}
            key={videoUrl}
          >
            <source src={videoUrl} type={currentMedia.mimeType} />
            {t("media.browser-does-not-support-playback")}
          </video>
        );
      case "audio":
        return (
          <Box className={styles.audioContainer}>
            <audio
              controls
              className={styles.audioPlayer}
              key={currentMedia.id}
            >
              <source src={currentMedia.url} type={currentMedia.mimeType} />
            </audio>
          </Box>
        );
      case "document":
        return (
          <Box className={styles.documentContainer}>
            <Typography variant="h6" className={styles.documentName}>
              {currentMedia.fileName || t("media.document")}
            </Typography>
            <Typography variant="body2" className={styles.documentHint}>
              {t("media.download-or-open-the-document")}
            </Typography>
            <button onClick={handleDownload} className={styles.documentButton}>
              {t("media.download-the-document")}
            </button>
          </Box>
        );
      default:
        return (
          <Typography className={styles.unsupportedText}>
            {t("media.unsupported-media-type")}
          </Typography>
        );
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={closeViewer}
      maxWidth="xl"
      fullWidth
      classes={{ paper: styles.dialogPaper }}
      BackdropProps={{ style: { backgroundColor: "rgba(0, 0, 0, 0.9)" } }}
    >
      <Box className={styles.header}>
        <IconButton onClick={closeViewer} className={styles.closeButton}>
          <CloseIcon />
        </IconButton>
        <IconButton onClick={handleDownload} className={styles.downloadButton}>
          <DownloadIcon />
        </IconButton>
      </Box>

      <DialogContent className={styles.content}>
        {hasPrevious && (
          <IconButton
            onClick={previousMedia}
            className={`${styles.navButton} ${styles.prevButton}`}
          >
            <NavigateBeforeIcon fontSize="large" />
          </IconButton>
        )}

        <Box className={styles.mediaContainer}>{renderMediaContent()}</Box>

        {hasNext && (
          <IconButton
            onClick={nextMedia}
            className={`${styles.navButton} ${styles.nextButton}`}
          >
            <NavigateNextIcon fontSize="large" />
          </IconButton>
        )}
      </DialogContent>
    </Dialog>
  );
}
