import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import useRequest from "../../hooks/use-request";
import Router
 from "next/router";
const OrderShow = ({ order, currentUser }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const { doRequest, errors } = useRequest({
        url: "/api/payments",
        method: "post",
        body: {
            orderId: order.id,
        },
        onSuccess: () => Router.push("/orders"),
    });

    useEffect(() => {
        const findTimeLeft = () =>{
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLeft/1000));
        };
        findTimeLeft();
        const timerId = setInterval(findTimeLeft, 1000);

        return () => {
            clearInterval(timerId);
        };
        
    }, [order]);
   
    if (timeLeft < 0) {
        return <div>Order Expired</div>;
    }

    return(
    <div>
        <div>{timeLeft} seconds until order expires</div>
        <StripeCheckout
            token={({ id }) => doRequest({token: id})}
            //TODO: Remove publishable key to secret or environment variable
            stripeKey="pk_test_51R9cdCRqLO3GEq05tLYs72H716BMHYTjPjkfPLJsNw3M4mfWMh9lTDBhmfR0KX8wh0RbSRhjCmG7KSoTQK66GoUk00u9BiQPDs" 
            amount={order.ticket.price * 100}
            email={currentUser.email}/>
            {errors}
    </div>
    );
};

OrderShow.getInitialProps = async (context, client, currentUser) => {
    const { orderId } = context.query;
    const { data } = await client.get(`/api/orders/${orderId}`);
    return { order: data, currentUser };
};
export default OrderShow;