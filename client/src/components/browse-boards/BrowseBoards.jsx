import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useAuth0 } from '@auth0/auth0-react';
import { useApiFetch } from '../../hooks/useApiFetch';
import BoardSearchBar from './BoardSearchBar';
import BoardCard from './BoardCard';
import LoadingState from '../app-components/LoadingState';
import LightBallsOverlay from '../visuals/LightBallsOverlay';
import './BrowseBoards.css';

const URL = import.meta.env.VITE_API_URL;

const BrowseBoards = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAccessTokenSilently } = useAuth0();
  const apiFetch = useApiFetch();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await apiFetch({
          endpoint: `${URL}/api/browse/users`,
          getAccessTokenSilently,
        });
        setAllUsers(data);
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (term) => {
    if (!term) {
      setUsers(allUsers);
    } else {
      const lower = term.toLowerCase();
      setUsers(
        allUsers.filter(
          (u) =>
            u.username?.toLowerCase().includes(lower) ||
            u.name?.toLowerCase().includes(lower)
        )
      );
    }
  };

  if (loading && users.length === 0) {
    return <LoadingState />;
  }

  return (
    <div className="App">
      <LightBallsOverlay />
      <Container className="browse-boards-container">
        <div className="browse-header">
          <h1 className="browse-title">Browse Boards</h1>
          <p className="browse-subtitle">Search boards from other users</p>
        </div>
        
        <BoardSearchBar 
          onSearch={handleSearch}
          loading={loading}
        />

        <div className="boards-scroll-container">
          <Row className="boards-grid">
            {users.map((user) => (
              <Col key={user._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                <BoardCard user={user} />
              </Col>
            ))}
          </Row>
        </div>
        
        {users.length === 0 && !loading && (
          <div className="no-results">
            <h3>No boards found</h3>
          </div>
        )}
      </Container>
    </div>
  );
};

export default BrowseBoards;