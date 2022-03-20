import { ElementTree } from "../../../out/ElementTree";
const AppComponent = (props) => {
    const [state, setState, stateProps] = ElementTree.stateful(props, props.stateObject);
    return [
        [
            {
                type: "component",
                component: {
                    func: AppComponent,
                    stateProps: stateProps,
                    stateObject: state,
                },
                children: [],
            },
        ],
        setState,
    ];
};
