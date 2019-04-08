/*
 * MAPPING THE BLIND SPOT
 */

jsPsych.plugins["blind-spot"] = (function() {

    var plugin = {};

    plugin.info = {
        name: "Blind Spot",
        parameters: {
            horizontal_N: {
                type: jsPsych.plugins.parameterType.INT,
                default: 17
            },
            vertical_N: {
                type: jsPsych.plugins.parameterType.INT,
                default: 10
            },
            column: {
                type: jsPsych.plugins.parameterType.INT,
                default: 1
            },
            row: {
                type: jsPsych.plugins.parameterType.INT,
                default: 1
            }
        }
    }

    plugin.trial = function(display_element, trial) {

        display_element.innerHTML = ''; // clear the screen

        var dots = {
            horizontal: trial.horizontal_N,
            vertical: trial.vertical_N
        };

        var column = trial.column;
        var row = trial.row;

        // body (background)
        var body = document.getElementsByClassName("jspsych-display-element")[0];
        body.style.backgroundColor = "black";

        // canvas
        var canvas = document.createElement("canvas");
        display_element.appendChild(canvas);
        canvas.width = 0.95 * window.innerWidth; // no-scrollbar workaround
        canvas.height = 0.95 * window.innerHeight; // no-scrollbar workaround

        // context
        var ctx = canvas.getContext("2d");

        var focusDot = {
            x: canvas.width / (2 * dots.horizontal),
            y: canvas.height / 2,
            colour: "blue"
        };

        done = false;

        // execute trial
        drawDot(focusDot);
        drawDot(transform(column, row, "white")); // draw the stimulus
        responseWait(); // wait for response

        function transform(i, j, col) {
            // compute coordinates based on grid array indices
            var dot = {
                colour: col,
                x: (j / (dots.horizontal)) * canvas.width + (1 / (2 * dots.horizontal)) * canvas.width,
                y: (i / (dots.vertical)) * canvas.height + (1 / (2 * dots.vertical)) * canvas.height
            };
            return dot;
        }

        function drawDot(dot) {
            // draw dot in desired position
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 8, 0, Math.PI*2);
            ctx.fillStyle = dot.colour;
            ctx.fill();
            return;
        }

        function responseWait() {
            /* waits for a valid response and calls function to end the trial */
            var listener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: response,
                // encode the user response and end the trial after valid key press
                valid_responses: [65, 83, 32],  // 'a', 's', ' '
                persist: false,
                allow_held_key: false
            });
        }

        function response(info) {
            if (info.key == 65 || info.key == 83) {
                done = true;
                toggleResponse(info);
            } else if (info.key == 32 && done) { // if the space bar is pressed to confirm selection
                confirm();
            }
            else {
                reponseWait();
            }
        }

        function toggleResponse(info) {

            ctx.font = '15pt Arial';
            ctx.textAlign = "center";

            ctx.fillStyle = "black";
            ctx.fillRect(focusDot.x - (3 * 16), focusDot.y - (8 + 15), 6 * 16, 15);

            var newFocusDot = focusDot;
            if (info.key == 65) {
                trial_data.seen = false;
                newFocusDot.colour = "red";
                ctx.fillStyle = "red";
                var msg = "not seen";
            } else if (info.key == 83) {
                trial_data.seen = true;
                newFocusDot.colour = "green";
                ctx.fillStyle = "green";
                var msg = "seen";
            }
            drawDot(newFocusDot);
            ctx.fillText(msg, focusDot.x, focusDot.y - 10);

            responseWait();
        }

        function confirm() {
            console.log(jsPsych.data.get().values());
            jsPsych.finishTrial(trial_data);
        }

        // data saving
        var trial_data = {
            seen: true,
            column: trial.column,
            row: trial.row
        };
    };
    return plugin;
})();
