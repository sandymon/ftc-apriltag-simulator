package org.firstinspires.ftc.teamcode;

import com.qualcomm.hardware.limelightvision.LLResult;
import com.qualcomm.hardware.limelightvision.LLResultTypes;
import com.qualcomm.hardware.limelightvision.Limelight3A;
import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import com.qualcomm.robotcore.hardware.DcMotor;
import com.qualcomm.robotcore.util.Range;

// Original teaching example: turn only, not distance control.
// Verify motor directions and upright camera mounting before running.
// Configure AprilTags in slot 0 and choose a tag present in your environment.
@TeleOp(name = "AprilTag Lab - Limelight Tank Align")
public class LimelightAlignTank extends LinearOpMode {
    private static final int DESIRED_TAG_ID = 20;
    private static final double TURN_GAIN = 0.01;
    private static final double MAX_TURN = 0.25;
    private static final double TOLERANCE_DEG = 2.0;

    @Override public void runOpMode() {
        Limelight3A camera = hardwareMap.get(Limelight3A.class, "limelight");
        DcMotor left = hardwareMap.get(DcMotor.class, "left_drive");
        DcMotor right = hardwareMap.get(DcMotor.class, "right_drive");
        left.setDirection(DcMotor.Direction.REVERSE);
        right.setDirection(DcMotor.Direction.FORWARD);
        try {
            camera.setPollRateHz(100);
            camera.pipelineSwitch(0);
            camera.start();
            waitForStart();
            while (opModeIsActive()) {
                LLResult result = camera.getLatestResult();
                LLResultTypes.FiducialResult desired = null;
                if (result != null && result.isValid()
                        && result.getPipelineIndex() == 0
                        && result.getStaleness() < 100) {
                    for (LLResultTypes.FiducialResult tag : result.getFiducialResults()) {
                        if (tag.getFiducialId() == DESIRED_TAG_ID) {
                            desired = tag;
                            break;
                        }
                    }
                }
                double drive = 0, turn = 0;
                if (gamepad1.left_bumper) {
                    // Held + no eligible target deliberately keeps both commands zero.
                    if (desired != null) {
                        double tx = desired.getTargetXDegreesNoCrosshair();
                        if (Math.abs(tx) > TOLERANCE_DEG) {
                            turn = Range.clip(-tx * TURN_GAIN, -MAX_TURN, MAX_TURN);
                        }
                        telemetry.addData("Target txNC (degrees)", tx);
                    }
                } else {
                    drive = -gamepad1.left_stick_y * 0.5;
                    turn = -gamepad1.right_stick_x * 0.25;
                }
                double leftPower = drive - turn;
                double rightPower = drive + turn;
                double scale = Math.max(1, Math.max(Math.abs(leftPower), Math.abs(rightPower)));
                left.setPower(leftPower / scale);
                right.setPower(rightPower / scale);
                telemetry.addData("Target eligible", desired != null);
                telemetry.addData("Drive / turn", "%.2f / %.2f", drive, turn);
                telemetry.update();
                sleep(20);
            }
        } finally {
            left.setPower(0);
            right.setPower(0);
            camera.stop();
        }
    }
}
