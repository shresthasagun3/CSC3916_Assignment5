import React, { useState } from 'react';
import { submitRegister } from '../actions/authActions';
import { useDispatch } from 'react-redux';
import { Form, Button } from 'react-bootstrap';

function Register() {
    const [details, setDetails] = useState({
        name: '',
        username: '',
        password: ''
    });

    const dispatch = useDispatch();

    const updateDetails = (event) => {
        setDetails({
          ...details,
            [event.target.id]: event.target.value
        });
    };

    const register = (event) => {
        event.preventDefault();
        dispatch(submitRegister(details));
    };

    return (
        <div className="register-container">
            <Form onSubmit={register} className='register-form bg-dark text-light p-4 rounded'>
                <Form.Group controlId="name" className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control onChange={updateDetails} value={details.name} type="text" placeholder="Name" />
                </Form.Group>

                <Form.Group controlId="username" className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control onChange={updateDetails} value={details.username} autoComplete="username" type="text" placeholder="Enter username" />
                </Form.Group>

                <Form.Group controlId="password" className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control onChange={updateDetails} value={details.password} autoComplete="current-password" type="password" placeholder="Password" />
                </Form.Group>
                <Button type="submit">Register</Button>
            </Form>
        </div>
    );
}

export default Register;