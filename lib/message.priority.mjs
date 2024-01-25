
export class MessagePriority {
    /**
     * @param { Number } priority
    */
    constructor(priority) {
        this.value = priority;
    }
    /**
     * @returns { HighPriorityMessage }
    */
    static get High() {
        return highPriority;
    }
    /**
     * @returns { MediumPriorityMessage }
    */
    static get Medium() {
        return mediumPriority;
    }
    /**
     * @returns { LowPriorityMessage }
    */
    static get Low() {
        return lowPriority;
    }
    /**
     * @param { Number } priority
     * @returns { MessagePriority }
    */
    static get(priority) {
        switch (priority) {
            case 1: {
                return highPriority;
            }
            case 2: {
                return mediumPriority;
            }
            case 3: {
                return lowPriority;
            }
        }
        return lowPriority;
    }
}

class HighPriorityMessage extends MessagePriority { }
class MediumPriorityMessage extends MessagePriority { }
class LowPriorityMessage extends MessagePriority { }

const highPriority = new HighPriorityMessage(1);
const mediumPriority = new MediumPriorityMessage(2);
const lowPriority = new LowPriorityMessage(3);