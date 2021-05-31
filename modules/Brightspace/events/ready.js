let {
    mainInterval,
    moduleData
} = require('../index')

const {
    checkFeedsAndUpdate
} = require('../helpers')

module.exports = async (client, _) => {
    //checkFeedsAndUpdate(moduleData, client)
    mainInterval = setInterval(() => {
        checkFeedsAndUpdate(moduleData, client)
    }, 300 * 1000);
}
