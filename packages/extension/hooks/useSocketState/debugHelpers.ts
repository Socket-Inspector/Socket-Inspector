import { createLogger } from '@/utils/customLogger';
import { getInitialState, reducer } from './reducer';
import { ReducerAction, SocketState } from './stateTypes';

export type ReducerHistoryItem = {
  action?: ReducerAction;
  result: SocketState;
};

const history: ReducerHistoryItem[] = [{ result: getInitialState() }];

const historyLogger = createLogger('REDUCER_HISTORY');

export const reducerWithHistory = (prevState: SocketState, action: ReducerAction): SocketState => {
  const nextState = reducer(prevState, action);
  history.push({ action, result: nextState });
  historyLogger(JSON.stringify(history));
  return nextState;
};
