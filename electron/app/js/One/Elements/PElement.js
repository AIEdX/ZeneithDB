export const PElement = (text, className) => {
    return [
        {
            type: "p",
            attrs: {
                className: className,
            },
            text: text,
        },
    ];
};
