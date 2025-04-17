import { useEffect } from "react";
import mqtt from "mqtt";
import {toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



const getSeverityStyle = (severity) => {
    switch(severity){
        case 1 : 
            return {background: "#c8e6c9", title: "Warning"};
    case 2:
        return { background: "#81c784", title: "Low" };
      case 3:
        return { background: "#fff176", title: "Medium" };
      case 4:
        return { background: "#ffb74d", title: "High" };
      case 5:
        return { background: "#e57373", title: "Critical" };
      default:
        return { background: "#eeeeee", title: "Info" };
    }
};


const NotificationHandler = () => {
    useEffect(() => {
        const client = mqtt.connect("ws://localhost:5001/ws/snmp");

        client.on("connect", () => {
            console.log("MQTT Connected");
            client.subscribe("alarm/notify");
        });

        client.on("message", (topic, message) => {
            try
            {
                const data = JSON.parse(message,toString());
                const {AlarmName,AlarmDescription,Severity} = data;
                
                const {background, title} = getSeverityStyle(Severity);
                console.log(title+":" +AlarmName);
                console.log(AlarmDescription);
                
                
                toast(
                    <div>
                        <strong>{title}: {AlarmName}</strong>
                        <div>{AlarmDescription}</div>
                    </div>,
                    {
                        position: "bottom-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        pauseOnHover: true,
                        closeOnClick: true,
                        style: {background},
                    }
                );
            }
            catch(err)
            {
                console.error("Invlaid JSON: ",message.toString());

            }
        });

        return () => {
            if(client.connected) client.end();
        };
    }, []);

    return <ToastContainer />;
};

export default NotificationHandler;