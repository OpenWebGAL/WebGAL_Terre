const logger = new (require('cloudlogjs'))();
logger.init('https://log.msfasr.com');
logger.setCollection('WebGAL_Origine')
module.exports = logger;