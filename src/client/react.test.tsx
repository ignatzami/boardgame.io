/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
/* eslint-disable unicorn/no-array-callback-reference */

import React from 'react';
import type { BoardProps } from './react';
import { Client } from './react';
import { render, screen, waitFor } from '@testing-library/react';
import { Local } from './transport/local';
import { SocketIO } from './transport/socketio';

class TestBoard extends React.Component<
  BoardProps & { doStuff?; extraValue? }
> {
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

test('debug ui can be turned off', () => {
  const Board = Client({
    game: {},
    board: TestBoard,
    debug: false,
  });

  const { container } = render(<Board />);
  expect(container.querySelectorAll('.debug-ui')).toHaveLength(0);
});

test('custom loading component', () => {
  const Loading = () => <div>custom</div>;
  const Board = Client({
    game: {},
    loading: Loading,
    board: TestBoard,
    multiplayer: SocketIO(),
  });
  const { container } = render(<Board />);
  expect(container.innerHTML).toContain('custom');
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
  const { container: container1, rerender: rerender1 } = render(<Board1 />);
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
  const { container: container2, rerender: rerender2 } = render(
    <Board2 matchID="a" playerID="1" credentials="foo" />
  );
  expect(container2.querySelector('#board')).toBeInTheDocument();

  rerender2(<Board2 matchID="next" playerID="next" credentials="bar" />);
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
