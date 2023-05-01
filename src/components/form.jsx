import React from 'react';


const form = (props) => {
 
    return(
        <>
         <form onSubmit = {props.call}>
           <input type="text" value={props.value} name="inputValue" ></input>
         </form>
        </>
    )


}

export default form;