export default class DateTimeParser
{
    start: Date;
    end: Date;

    constructor(dateTimeSection: any) {
        const jsonString = JSON.stringify(dateTimeSection || "");  

        [this.start, this.end] = this.findStartAndEnd(jsonString);
    }
    
    private findStartAndEnd(dateTimeElement: string) : [Date, Date] {
        let startStr = this.findPropertyValueBasedOnKey(dateTimeElement, "start");
        const endStr = this.findPropertyValueBasedOnKey(dateTimeElement, "end");

        let start: Date;
        let end: Date;

        if(startStr == null) {
            startStr = this.findPropertyValueBasedOnKey(dateTimeElement, "value");
        }
    
        if (startStr != null) {
            start = this.parseDateTime(startStr);
        } else {
            //If not specified assume meeting now.
            start = new Date();
        }

        if(endStr != null) {
            end = this.parseDateTime(endStr);
        } else {
            end = new Date(start.toString());

            //Assume 1 hour from start
            end.setTime(start.getTime() + (60*60*1000));
        }

        return [start, end];
    }

    private parseDateTime(input: string) {
        if(input.includes("-")) {
        return new Date(input);
        }

        const now = new Date();

        return new Date(`${now.getFullYear()}-${now.getMonth() + 1 }-${now.getDate()} ${input}`);
    }

    private findPropertyValueBasedOnKey(input: string, requiredProperty: string) : string | null {
        const regex = new RegExp(`"${requiredProperty}":"(.*?)"`);

        const match = input.match(regex);

        if(match != null && match.length > 1) {
        return match[1];
        }

        return null;
    }
}