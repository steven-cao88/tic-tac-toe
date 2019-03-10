import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
  const { value, onClick, selected, winningSquare } = props;
  let className = ['square'];
  if (selected) className.push('selected');
  if (winningSquare) className.push('winning');
  className = className.join(' ');
  return (
    <button className={className} onClick={onClick}>
      {value}
    </button>
  );
}
class Board extends React.Component {
  renderSquare(i) {
    const value = this.props.squares[i];
    return (
      <Square
      winningSquare={this.props.winningSquares && this.props.winningSquares.includes(i)}
      key={i}
      selected={value !== null}
      value={value} onClick={() => this.props.onClick(i)}
      />
    );
  }

  renderRow(rowNumber) {
    let columns = Array(3).fill();
    columns = columns.map((colum, index) => this.renderSquare(3 * rowNumber + index));
    return (
      <div className="board-row" key={rowNumber}>
        {columns}
      </div>
    );
  }

  render() {
    let rows = Array(3).fill();
    rows = rows.map((row, rowNumber) => this.renderRow(rowNumber));
    return (
      <div>
        {rows}
      </div>
    );
  }
}

class Game extends React.Component {
  state = {
    history: [
      {
        squares: Array(9).fill(null),
        selectedSquare: null,
        move: 0,
      }
    ],
    stepNumber: 0,
    xIsNext: true,
    order: 'asc',
  };

  getLocation(i) {
    const x = Math.floor(i / 3);
    const y = i % 3;
    return `(${x}, ${y})`;
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (squares[i] || calculateWinner(squares)) return;

    squares[i] = this.state.xIsNext ? "X" : "O";

    const xIsNext = !this.state.xIsNext;
    const selectedSquare = i;
    const move = this.state.stepNumber + 1;

    this.setState({
      history: history.concat([{ squares, selectedSquare, move }]),
      xIsNext,
      stepNumber: history.length,
    });
  }

  jumpTo(stepNumber) {
    this.setState({
      stepNumber,
      xIsNext: stepNumber % 2 === 0,
      moveCounter: stepNumber + 1,
    });
  }

  changeOrder () {
    this.setState({
      order: this.state.order === 'asc' ? 'desc' : 'asc',
    });
  }

  sort () {
    const order = this.state.order;
    const history = this.state.history.slice();
    if (order === 'asc') {
      return history.sort((history1, history2) => history1.move - history2.move);
    } else {
      return history.sort((history1, history2) => history2.move - history1.move);
    }
  }

  render() {
    const history = this.state.history;
    const sortedHistory = this.sort();
    const current = history[this.state.stepNumber];
    const winningCombition = calculateWinner(current.squares);
    const winner = winningCombition ? current.squares[winningCombition[0]] : null;

    const moves = sortedHistory.map(({selectedSquare, move}) => {
      const desc = move ? "Go to move #" + move : "Go to game start";
      return (
        <li key={move}>
          { selectedSquare !== null ? 'selected: ' + this.getLocation(selectedSquare) : ''}
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    const draw = isDraw(current.squares);

    const status = winner
      ? "Winner: " + winner
      : draw
      ? "This is a draw"
      : "Next Player: " + (this.state.xIsNext ? "X" : "O");



    return (
      <div className="game">
        <div className="game-board">
          <Board squares={current.squares}
            winningSquares={winningCombition}
            onClick={i => this.handleClick(i)} />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>
            <button onClick={() => this.changeOrder()}>
              {this.order === 'asc'? 'Show latest move first' : 'Show latest move last'}
            </button>
          </div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function calculateWinner(squares) {
  for (let i = 0; i < winningCombinations.length; i++) {
    const [a, b, c] = winningCombinations[i];

    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return winningCombinations[i];
    }
  }

  return null;
}

function isDraw(squares) {
  let combinations = winningCombinations.slice();
  combinations = combinations.map(
    combination => isCombinationPossible(combination, squares)
  );
  for (let isCombinationPossible of combinations) {
    if (isCombinationPossible) return false;
  }
  return true;
}

function isCombinationPossible(combination, squares) {
  for (let i = 0, square = combination[i]; i < combination.length; i++) {
    if (squares[square]) {
      for (let j = i, nextSquare = combination[j]; j < combination.length; j++) {
        if (squares[nextSquare] && squares[square] !== squares[nextSquare]) {
          return false;
        }
      }
    }
  }
  return true;
}

ReactDOM.render(<Game />, document.getElementById("root"));
