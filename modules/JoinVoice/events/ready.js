const {
    moduleData
} = require('../')
module.exports = async (client, _) => {
    console.log('joinvoice.ready')
    moduleData.set('didItWork', 'you betcha!')
}