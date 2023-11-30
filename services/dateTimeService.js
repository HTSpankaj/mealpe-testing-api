const moment = require("moment-timezone");

function formatTime(inputTime) {
    const [hours, minutes, seconds] = inputTime.split('.').map(Number);
    let formattedTime;
    formattedTime = Number(`${hours}.${minutes}`);
    return formattedTime;
}

function isTimeInRange(__time, __beforeTime, __afterTime) {
    let time = moment(__time).format('HH:mm:ss')
    let beforeTime = moment(__beforeTime).format('HH:mm:ss')
    let afterTime = moment(__afterTime).format('HH:mm:ss')
    let _selectedTime = formatTime(
        time.replace(/:/g, '.'),
    );
    let _startTime = formatTime(beforeTime.replace(/:/g, '.'));
    let _closeTime = formatTime(afterTime.replace(/:/g, '.'));
    let temp = null;

    _startTime = _startTime == 0 ? 24 : _startTime;
    _closeTime = _closeTime == 0 ? 24 : _closeTime;


    if (_closeTime < _startTime) {
        temp = _startTime;
        _startTime = _closeTime;
        _closeTime = temp;
    }

    const isBetween =
        _selectedTime >= _startTime && _selectedTime <= _closeTime;
    return isBetween
}

module.exports = {
    isTimeInRange
}
