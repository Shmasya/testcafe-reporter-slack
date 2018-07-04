import SlackMessage from './SlackMessage'

export default function () {
    return {

        noColors: true,

        reportTaskStart (startTime, userAgents, testCount) {
            this.slack = new SlackMessage();
            this.startTime = startTime;
            this.testCount = testCount;
        },

        reportFixtureStart (name, path) {
            this.currentFixtureName = name;
        },

        reportTestDone (name, testRunInfo) {
            const hasErr = testRunInfo.errs.length > 0;
            const result = hasErr ? ':heavy_multiplication_x:' : ':heavy_check_mark: ';

            if (hasErr) {
                this.slack.addMessage(`${this.currentFixtureName} — ${result} ${name}`);
                this.renderErrors(testRunInfo.errs);
            }
        },

        renderErrors(errors) {
            errors.forEach((error, id) => {
                this.slack.addErrorMessage(this.formatError(error, `${id + 1} `));
            })
        },

        reportTaskDone (endTime, passed, warnings) {
            const durationMs  = endTime - this.startTime;
            const durationStr = this.moment
                .duration(durationMs)
                .format('h[h] mm[m] ss[s]')
            let footer = passed === this.testCount ?
                `${this.testCount} passed` :
                `${this.testCount - passed}/${this.testCount} failed`;

            footer = `\n*${footer}* (Duration: ${durationStr})`;

            this.slack.addMessage(footer);
            this.slack.sendTestReport(this.testCount - passed);
        }
    }
}
