import * as React from "react";

export function useToast() {
	const [toasts, setToasts] = React.useState([]);

	const toast = React.useCallback(({ ...props }) => {
		const id = Math.random().toString(36).slice(2, 9);
		setToasts((prevToasts) => [...prevToasts, { id, ...props }]);
		return id;
	}, []);

	const dismiss = React.useCallback((toastId) => {
		setToasts((prevToasts) =>
			prevToasts.filter((toast) => toast.id !== toastId)
		);
	}, []);

	return {
		toast,
		dismiss,
		toasts,
	};
}