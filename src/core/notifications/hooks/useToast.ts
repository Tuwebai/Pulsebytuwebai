import * as React from 'react';

import type {
  ToastActionElement,
  ToastProps,
} from '@/components/ui/toast';

const TOAST_LIMIT = 1;
const TOAST_DURATION = 5000;
const TOAST_REMOVE_DELAY = 200;

type PulseToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type Action =
  | {
      type: 'ADD_TOAST';
      toast: PulseToast;
    }
  | {
      type: 'UPDATE_TOAST';
      toast: Partial<PulseToast>;
    }
  | {
      type: 'DISMISS_TOAST';
      toastId?: PulseToast['id'];
    }
  | {
      type: 'REMOVE_TOAST';
      toastId?: PulseToast['id'];
    };

interface State {
  toasts: PulseToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const clearRemoveQueue = (toastId?: string) => {
  if (!toastId) {
    toastTimeouts.forEach((timeout) => clearTimeout(timeout));
    toastTimeouts.clear();
    return;
  }

  const timeout = toastTimeouts.get(toastId);
  if (timeout) {
    clearTimeout(timeout);
    toastTimeouts.delete(toastId);
  }
};

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: 'REMOVE_TOAST',
      toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TOAST':
      state.toasts.forEach((toast) => {
        clearRemoveQueue(toast.id);
      });
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((toast) =>
          toast.id === action.toast.id ? { ...toast, ...action.toast } : toast
        ),
      };

    case 'DISMISS_TOAST': {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((toast) =>
          toast.id === toastId || toastId === undefined
            ? {
                ...toast,
                open: false,
              }
            : toast
        ),
      };
    }

    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        clearRemoveQueue();
        return {
          ...state,
          toasts: [],
        };
      }

      clearRemoveQueue(action.toastId);
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type Toast = Omit<PulseToast, 'id'>;

function toast({ ...props }: Toast) {
  const id = genId();

  const update = (nextToast: PulseToast) =>
    dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...nextToast, id },
    });
  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      duration: props.duration ?? TOAST_DURATION,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) {
          dismiss();
        }
      },
    },
  });

  return {
    id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);

    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  };
}

export { useToast, toast };
