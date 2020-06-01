let {
    mainInterval,
    moduleData
} = require('../index')

const {
    checkFeedsAndUpdate
} = require('../helpers')

module.exports = async (client, _) => {
    checkFeedsAndUpdate(moduleData)
    mainInterval = setInterval(() => {
        checkFeedsAndUpdate(moduleData)
    }, 300 * 1000);
}