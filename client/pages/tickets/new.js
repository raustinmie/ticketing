import { useState } from "react";
import useRequest from "../../hooks/use-request";
import Router from "next/router";

const NewTicket = () => {
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const { doRequest, errors } = useRequest({
        url: "/api/tickets",
        method: "post",
        body: {
            title,
            price
        },
        onSuccess: () => Router.push('/')
    });

    const onBlur = () => {
        const value = parseFloat(price);
        if (isNaN(value)) {
            return;
        }
        setPrice(value.toFixed(2));
    }

    const onSubmit = (e) => {
        console.log("onSubmit", e);
        e.preventDefault();
        doRequest();
    };

    return(
        <div>
            <h1>Create a ticket</h1>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Title</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)}
                    type="text" className="form-control" id="title" placeholder="Enter ticket title" />
                </div>
                <div className="form-group">
                    <label>Price</label>
                    <input value={price} onBlur={onBlur} onChange={(e) => setPrice(e.target.value)}
                    type="text" className="form-control" id="title" placeholder="Enter ticket price" />
                </div>
                {errors}
                <button className="btn btn-primary">Submit</button>
            </form>
        </div>
    )
};

export default NewTicket;