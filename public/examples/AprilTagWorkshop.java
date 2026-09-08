package org.firstinspires.ftc.teamcode;

import com.qualcomm.hardware.limelightvision.LLResult;
import com.qualcomm.hardware.limelightvision.Limelight3A;
import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

// Configure Limelight pipeline 0 for AprilTags before running.
// This telemetry-only example does not command motors.
@TeleOp(name = "AprilTag Workshop")
public class AprilTagWorkshop extends LinearOpMode {
    @Override public void runOpMode() {
        Limelight3A limelight = hardwareMap.get(
                Limelight3A.class, "limelight");
        try {
            limelight.pipelineSwitch(0);
            limelight.start();
            waitForStart();

            while (opModeIsActive()) {
                LLResult result = limelight.getLatestResult();
                if (result != null && result.isValid()) {
                    telemetry.addData("tx (degrees)", result.getTx());
                } else {
                    telemetry.addLine("No valid target");
                }
                telemetry.update();
                sleep(20);
            }
        } finally {
            limelight.stop();
        }
    }
}
