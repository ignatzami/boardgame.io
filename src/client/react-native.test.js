/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
/* eslint-disable unicorn/no-array-callback-reference */

import React from 'react';
import { Client } from './react-native';
import { render } from '@testing-library/react';
import { Local } from './transport/local';
import { Transport } from './transport/transport';

class NoConnectionTransport extends Transport {
  connect() {}
  disconnect() {}
  sendAction() {}
  sendChatMessage() {}
  requestSync() {}
  updateMatchID() {}
  updatePlayerID() {}
  updateCredentials() {}
}

class TestBoard extends React.Component {
  render() {
    return <div id="board">Board</div>;
  }
}

test('board is rendered', () => {
  const Board = Client({
    game: {},
    board: TestBoard,
  });

  const { container, unmount } = render(<Board />);
  expect(container.querySelector('#board')).toBeInTheDocument();
  expect(container.querySelector('#board')?.textContent).toBe('Board');

  unmount();
});

test('board is rendered with custom loading', () => {
  const Loading = () => <>connecting...</>;

  const Board = Client({
    game: {},
    board: TestBoard,
    loading: Loading,
    multiplayer: (opts) => new NoConnectionTransport(opts),
  });

  const { container } = render(<Board />);
  expect(container.textContent).toContain('connecting...');
});

test('board props', () => {
  const Board = Client({
    game: {},
    board: TestBoard,
  });
  const { container } = render(<Board />);
  expect(container.querySelector('#board')).toBeInTheDocument();
});

test('can pass extra props to Client', () => {
  const Board = Client({
    game: {},
    board: TestBoard,
  });
  const { container } = render(
    <Board doStuff={() => true} extraValue={55} />
  );
  expect(container.querySelector('#board')).toBeInTheDocument();
});

test('can pass empty board', () => {
  const Board = Client({
    game: {},
  });

  const { container } = render(<Board />);
  expect(container).not.toBe(undefined);
});

test('move api', () => {
  const Board = Client({
    game: {
      moves: {
        A: (_, arg) => ({ arg }),
      },
    },
    board: TestBoard,
  });

  const { container } = render(<Board />);
  expect(container.querySelector('#board')).toBeInTheDocument();
});

test('update matchID / playerID', () => {
  // No multiplayer.
  const Board1 = Client({
    game: {
      moves: {
        A: (_, arg) => ({ arg }),
      },
    },
    board: TestBoard,
  });
  const { container: container1 } = render(<Board1 />);
  expect(container1.querySelector('#board')).toBeInTheDocument();

  // Multiplayer.
  const Board2 = Client({
    game: {
      moves: {
        A: (_, arg) => ({ arg }),
      },
    },
    board: TestBoard,
    multiplayer: Local(),
  });
  const { container: container2 } = render(
    <Board2 matchID="a" playerID="1" credentials="foo" />
  );
  expect(container2.querySelector('#board')).toBeInTheDocument();
});

test('local playerView', () => {
  const Board = Client({
    game: {
      setup: () => ({ secret: true }),
      playerView: ({ playerID }) => ({ stripped: playerID }),
    },
    board: TestBoard,
    numPlayers: 2,
  });

  const { container } = render(<Board playerID="1" />);
  expect(container.querySelector('#board')).toBeInTheDocument();
});

test('reset Game', () => {
  const Board = Client({
    game: {
      moves: {
        A: (_, arg) => ({ arg }),
      },
    },
    board: TestBoard,
  });

  const { container } = render(<Board />);
  expect(container.querySelector('#board')).toBeInTheDocument();
});

test('can receive enhancer', () => {
  const enhancer = jest.fn().mockImplementation((next) => next);
  const Board = Client({
    game: {},
    board: TestBoard,
    enhancer,
  });

  render(<Board />);
  expect(enhancer).toBeCalled();
});
