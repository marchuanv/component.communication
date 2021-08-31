function CommunicationPriority({ isHigh }) {
    this.High = 1;
    this.Low = 0;
    this.index = isHigh === true ? this.High : this.Low;
};
module.exports = CommunicationPriority;