let {
    mainInterval
} = require('../index')

const {
    checkFeedsAndUpdate
} = require('../helpers')

module.exports = async (client, _) => {
    checkFeedsAndUpdate()
    mainInterval = setInterval(() => {
        checkFeedsAndUpdate()
    }, 300 * 1000);
}