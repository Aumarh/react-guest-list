/* eslint-disable no-restricted-globals */
import './App.css';
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef, useState } from 'react';

const appStyles = css`
  margin: 0;
  width: 100vw;
  background: radial-gradient(
    circle,
    rgba(238, 174, 202, 1) 0%,
    rgba(148, 187, 233, 1) 100%
  );

  h1 {
    text-align: center;
    font-family: cursive;
  }

  label {
    display: flex;
  }

  input {
    border-radius: 8px;
    height: 26px;
  }
`;

const formStyles = css`
  display: flex;
  justify-content: center;
  margin-left: 10px;
`;

const enterButtonStyles = css`
  margin-left: 30px;
  width: 8em;
  height: 2.1em;
  font-size: 20px;
  letter-spacing: 1.5px;
  cursor: pointer;
  border-radius: 11px;

  button:hover {
    background: #eeaeca;
  }
`;

const nameStyles = css`
  margin-left: 16px;
`;

export default function App() {
  const baseUrl = 'https://aumarh-guest-list.herokuapp.com';
  // const baseUrl = 'https://react-guestbook-api.herokuapp.com';

  // declaring guest name
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // declaring variables for API
  const [guests, setGuests] = useState([]);
  const [refetch, setRefetch] = useState(true);
  const [loading, setLoading] = useState(true);
  console.log('this is the guest', guests);

  // input field identifiers
  const inputFirstName = useRef(null);
  const inputLastName = useRef(null);

  // console.log('Loading...:', loading);

  // fetching guest info
  useEffect(() => {
    console.log('refetching guest info...');

    async function getGuests() {
      const response = await fetch(`${baseUrl}/guests`);
      console.log('response', response);
      setLoading(false);

      const allGuests = await response.json();
      setGuests(allGuests);
      console.log('allGuests', allGuests);
    }
    console.log(getGuests());
    getGuests().catch(() => {
      console.log('fetching failed');
      setTimeout(() => setRefetch(!refetch), 10000);
    });
  }, [refetch]);

  // creating a new guest list
  async function createGuest(newGuest) {
    const response = await fetch(`${baseUrl}/guests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: newGuest[0].trim(),
        lastName: newGuest[1].trim(),
      }),
    });
    const createdGuest = await response.json();
    const newGuests = [...guests, createdGuest];
    // console.log(newGuests);
    setGuests(newGuests);

    inputFirstName.current.value = '';
    setFirstName('');
    inputLastName.current.value = '';
    setLastName('');
  }

  // deleting a guest
  async function deleteGuest(id) {
    const response = await fetch(`${baseUrl}/guests/${id}`, {
      method: 'DELETE',
    });
    const deletedGuest = await response.json();
    const newGuests = guests.filter((guest) => {
      return guest.id !== deletedGuest.id;
    });
    setGuests(newGuests);
  }

  // updating guest list
  async function updatedGuestList(id, status) {
    const response = await fetch(`${baseUrl}/guests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        attending: status,
      }),
    });
    const updatedGuest = await response.json();
    const newGuests = guests.map((guest) => {
      console.log(guest);
      if (guest.id === updatedGuest.id) {
        return { ...guest, attending: updatedGuest.attending };
      }
      return guest;
    });
    setGuests(newGuests);
  }
  console.log(typeof guests);
  console.log('loading', loading);

  return (
    <div css={appStyles}>
      <header>
        <h1>Aumarh's Guest List</h1>
      </header>
      <div css={formStyles} data-test-id="guest">
        <div css={nameStyles}>
          <label>
            First name:
            <input
              disabled={loading ? true : false}
              ref={inputFirstName}
              type="firstName"
              placeholder="first name"
              onChange={(event) => {
                setFirstName(event.currentTarget.value);
              }}
            />
          </label>
        </div>
        <br />
        <div>
          <label css={nameStyles}>
            Last name:
            <input
              disabled={loading ? true : false}
              ref={inputLastName}
              type="lastName"
              placeholder="last name"
              onChange={(event) => {
                setLastName(event.currentTarget.value);
              }}
            />
          </label>
        </div>
        <div css={enterButtonStyles}>
          <button
            onClick={(event) => {
              createGuest([firstName, lastName]).catch('new guest not created');
            }}
          >
            Enter
          </button>
        </div>
      </div>
      <div>
        {loading ? (
          <h2>Loading....</h2>
        ) : (
          <div>
            {guests.map((guest) => {
              return (
                <div data-test-id="guest" key={guest.id}>
                  <div>
                    <span>{`${guest.firstName} ${guest.lastName}`}</span>
                  </div>
                  <div>
                    <label>
                      is attending
                      <input
                        checked={guest.attending}
                        type="checkbox"
                        aria-label="is attending"
                        onChange={(event) => {
                          updatedGuestList(
                            guest.id,
                            event.currentTarget.checked,
                          ).catch(() => {});
                        }}
                      />
                    </label>
                  </div>
                  <div>
                    <button
                      aria-label="Remove"
                      onClick={() => {
                        deleteGuest(guest.id).catch(() => {});
                      }}
                    >
                      Delete guest
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
