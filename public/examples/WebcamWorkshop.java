package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import org.firstinspires.ftc.robotcore.external.hardware.camera.WebcamName;
import org.firstinspires.ftc.vision.VisionPortal;
import org.firstinspires.ftc.vision.apriltag.AprilTagDetection;
import org.firstinspires.ftc.vision.apriltag.AprilTagProcessor;

import java.util.List;

// Detection-only version of the FIRST webcam tank example; no motor commands.
@TeleOp(name = "AprilTag Lab - Webcam Basics")
public class WebcamWorkshop extends LinearOpMode {
    private static final int DESIRED_TAG_ID = -1; // -1 accepts any known tag.
    private VisionPortal visionPortal;
    private AprilTagProcessor aprilTag;

    @Override public void runOpMode() {
        initAprilTag();

        telemetry.addLine("Camera ready. Touch START.");
        telemetry.update();
        waitForStart();

        try {
            while (opModeIsActive()) {
                AprilTagDetection desiredTag = findDesiredTag();

                if (desiredTag != null) {
                    telemetry.addData("Found", "ID %d (%s)", desiredTag.id, desiredTag.metadata.name);
                    telemetry.addData("Range", "%5.1f inches", desiredTag.ftcPose.range);
                    telemetry.addData("Bearing", "%3.0f degrees", desiredTag.ftcPose.bearing);
                    telemetry.addData("Yaw", "%3.0f degrees", desiredTag.ftcPose.yaw);
                } else {
                    telemetry.addLine("No desired known tag");
                }

                telemetry.update();
                sleep(20);
            }
        } finally {
            visionPortal.close();
        }
    }

    private AprilTagDetection findDesiredTag() {
        List<AprilTagDetection> currentDetections = aprilTag.getDetections();
        for (AprilTagDetection detection : currentDetections) {
            if (detection.metadata == null) {
                telemetry.addData("Unknown", "Tag ID %d is not in TagLibrary", detection.id);
                continue;
            }
            if (DESIRED_TAG_ID < 0 || detection.id == DESIRED_TAG_ID) {
                return detection;
            }
            telemetry.addData("Skipping", "Tag ID %d is not desired", detection.id);
        }
        return null;
    }

    private void initAprilTag() {
        aprilTag = new AprilTagProcessor.Builder().build();
        aprilTag.setDecimation(2);

        visionPortal = new VisionPortal.Builder()
                .setCamera(hardwareMap.get(WebcamName.class, "Webcam 1"))
                .addProcessor(aprilTag)
                .build();
    }
}
