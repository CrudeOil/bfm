export class Colors {
    public static black = '#000';
    public static white = '#FFF';
    public static red = '#F00';
    public static green = '#0F0';
    public static blue = '#00F';
}

export class Color {
    public constructor(
        public hash: string|Colors = "#FFF"
    ) {}

    public valueOf() {
        return this.hash as string;
    }
}
