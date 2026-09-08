package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import org.firstinspires.ftc.robotcore.external.hardware.camera.WebcamName;
import org.firstinspires.ftc.robotcore.external.navigation.AngleUnit;
import org.firstinspires.ftc.robotcore.external.navigation.DistanceUnit;
import org.firstinspires.ftc.vision.VisionPortal;
import org.firstinspires.ftc.vision.apriltag.AprilTagDetection;
import org.firstinspires.ftc.vision.apriltag.AprilTagProcessor;

// Original detection-only workshop example; no motor commands.
// Uses the SDK's tag library. Select an ID known to your installed library.
@TeleOp(name = "AprilTag Lab - Webcam")
public class WebcamWorkshop extends LinearOpMode {
    private static final int DESIRED_TAG_ID = 20;

    @Override public void runOpMode() {
        AprilTagProcessor aprilTag = new AprilTagProcessor.Builder()
                .setOutputUnits(DistanceUnit.INCH, AngleUnit.DEGREES)
                .build();
        VisionPortal visionPortal = new VisionPortal.Builder()
                .setCamera(hardwareMap.get(WebcamName.class, "Webcam 1"))
                .addProcessor(aprilTag)
                .build();
        try {
            waitForStart();
            while (opModeIsActive()) {
                boolean found = false;
                for (AprilTagDetection detection : aprilTag.getDetections()) {
                    if (detection.id != DESIRED_TAG_ID) continue;
                    if (detection.metadata != null && detection.ftcPose != null) {
                        found = true;
                        telemetry.addData("ID", detection.id);
                        telemetry.addData("Range (in)", detection.ftcPose.range);
                        telemetry.addData("Bearing (degrees)", detection.ftcPose.bearing);
                        telemetry.addData("Yaw (degrees)", detection.ftcPose.yaw);
                    } else {
                        telemetry.addData("Unknown tag", detection.id);
                    }
                }
                if (!found) telemetry.addLine("No desired tag with pose");
                telemetry.update();
                sleep(20);
            }
        } finally {
            visionPortal.close();
        }
    }
}
