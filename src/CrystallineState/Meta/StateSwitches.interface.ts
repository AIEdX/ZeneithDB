


export interface StateSwitchesInterface<T> {

   getSwitch(switchName: T) : boolean;
   toggleSwitch(switchName: T) : void;
   setSwitch(switchName: T,value : boolean) : void;

}