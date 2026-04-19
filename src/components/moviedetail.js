import React, { useEffect, useState } from 'react';
import { fetchMovie } from '../actions/movieActions';
import { useDispatch, useSelector } from 'react-redux';
import { Card, ListGroup, ListGroupItem, Image, Form, Button } from 'react-bootstrap';
import { BsStarFill } from 'react-icons/bs';
import { useParams } from 'react-router-dom';

const env = process.env;

const MovieDetail = () => {
  const dispatch = useDispatch();
  const { movieId } = useParams();
  const selectedMovie = useSelector(state => state.movie.selectedMovie);
  const loading = useSelector(state => state.movie.loading);
  const error = useSelector(state => state.movie.error);

  const [review, setReview] = useState('');
  const [rating, setRating] = useState(1);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    dispatch(fetchMovie(movieId));
  }, [dispatch, movieId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const response = await fetch(`${env.REACT_APP_API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({
          movieId: selectedMovie._id,
          review: review,
          rating: parseInt(rating)
        }),
        mode: 'cors'
      });

      if (!response.ok) {
        throw Error(response.statusText);
      }

      setSubmitSuccess('Review submitted successfully!');
      setReview('');
      setRating(1);
      dispatch(fetchMovie(movieId));
    } catch (e) {
      setSubmitError('Failed to submit review. Please try again.');
    }
  };

  if (loading) return <div>Loading....</div>;
  if (error) return <div>Error: {error}</div>;
  if (!selectedMovie) return <div>No movie data available.</div>;

  return (
    <Card className="bg-dark text-dark p-4 rounded">
      <Card.Header>Movie Detail</Card.Header>
      <Card.Body>
        <Image className="image" src={selectedMovie.imageUrl} thumbnail />
      </Card.Body>
      <ListGroup>
        <ListGroupItem>{selectedMovie.title}</ListGroupItem>
        <ListGroupItem>
          {selectedMovie.actors && selectedMovie.actors.map((actor, i) => (
            <p key={i}>
              <b>{actor.actorName}</b> {actor.characterName}
            </p>
          ))}
        </ListGroupItem>
        <ListGroupItem>
          <h4>
            <BsStarFill /> {selectedMovie.avgRating}
          </h4>
        </ListGroupItem>
      </ListGroup>

      {/* Reviews List */}
      <Card.Body className="card-body bg-white">
        <h5>Reviews</h5>
        {selectedMovie.reviews && selectedMovie.reviews.length > 0 ? (
          selectedMovie.reviews.map((review, i) => (
            <p key={i}>
              <b>{review.username}</b>&nbsp; {review.review} &nbsp; <BsStarFill />{' '}
              {review.rating}
            </p>
          ))
        ) : (
          <p>No reviews yet. Be the first to review!</p>
        )}
      </Card.Body>

      {/* Submit Review Form */}
      <Card.Body className="bg-white">
        <h5>Submit a Review</h5>
        {submitError && <p style={{ color: 'red' }}>{submitError}</p>}
        {submitSuccess && <p style={{ color: 'green' }}>{submitSuccess}</p>}
        <Form onSubmit={handleSubmitReview}>
          <Form.Group controlId="rating" className="mb-3">
            <Form.Label>Rating (1-5)</Form.Label>
            <Form.Control
              as="select"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              <option value={1}>1 </option>
              <option value={2}>2 </option>
              <option value={3}>3 </option>
              <option value={4}>4 </option>
              <option value={5}>5 </option>
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="reviewText" className="mb-3">
            <Form.Label>Review</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Write your review here..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              required
            />
          </Form.Group>
          <Button type="submit" variant="primary">Submit Review</Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default MovieDetail;