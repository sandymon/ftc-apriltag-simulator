import type { Source } from "./types";
const ftc = "https://ftc-docs.firstinspires.org/en/latest/apriltag/vision_portal/";
const ll = "https://docs.limelightvision.io/docs/docs-limelight/";
export const sources: Record<string, Source> = {
  intro: { title: "FTC · AprilTag introduction", url: ftc + "apriltag_intro/apriltag-intro.html", reviewed: "2026-09-08" },
  portal: { title: "FTC · VisionPortal overview", url: ftc + "visionportal_overview/visionportal-overview.html", reviewed: "2026-09-08" },
  init: { title: "FTC · VisionPortal initialization", url: ftc + "visionportal_init/visionportal-init.html", reviewed: "2026-09-08" },
  processor: { title: "FTC · Vision processor initialization", url: ftc + "vision_processor_init/vision-processor-init.html", reviewed: "2026-09-08" },
  controls: { title: "FTC · Camera controls", url: ftc + "visionportal_camera_controls/visionportal-camera-controls.html", reviewed: "2026-09-08" },
  bandwidth: { title: "FTC · CPU & bandwidth", url: ftc + "visionportal_cpu_and_bandwidth/visionportal-cpu-and-bandwidth.html", reviewed: "2026-09-08" },
  pose: { title: "FTC · Understanding AprilTag detection values", url: "https://ftc-docs.firstinspires.org/en/latest/apriltag/understanding_apriltag_detection_values/understanding-apriltag-detection-values.html", reviewed: "2026-09-08" },
  library: { title: "FTC · AprilTag library", url: ftc + "apriltag_library/apriltag-library.html", reviewed: "2026-09-08" },
  quick: { title: "Limelight · 3A quick-start", url: ll + "getting-started/limelight-3a", reviewed: "2026-09-08" },
  pipeline: { title: "Limelight · Pipeline setup", url: ll + "getting-started/pipelines", reviewed: "2026-09-08" },
  tracking: { title: "Limelight · Tracking AprilTags", url: ll + "pipeline-apriltag/apriltags", reviewed: "2026-09-08" },
  java: { title: "Limelight · FTC programming guide", url: ll + "apis/ftc-programming", reviewed: "2026-09-08" },
  tank: { title: "FIRST · Tank drive-to-AprilTag sample", url: "https://github.com/FIRST-Tech-Challenge/FtcRobotController/blob/26cd1fdd2a3c4b26173d9ff33a3279c27d1c7ad1/FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller/external/samples/RobotAutoDriveToAprilTagTank.java", reviewed: "2026-09-08" },
  deck: { title: "Reference · Limelight 3A Tutorial", url: "https://docs.google.com/presentation/d/1v-s8sG60iSbBq0LetFFla8qH7atbK3frAVOAXwSYgKI/edit", reviewed: "2026-09-08" },
};
