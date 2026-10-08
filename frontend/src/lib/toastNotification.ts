import { toast } from 'react-toastify';

export const toastSuccess = (mes: string, autoClose: number = 3000) => {
    toast.success(mes, {
        position: 'top-right',
        autoClose: autoClose,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });
};

export const toastWarning = (mes: string, autoClose: number = 3000) => {
    toast.warning(mes, {
        position: 'top-right',
        autoClose: autoClose,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });
};

export const toastError = (mes: string, autoClose: number = 3000) => {
    toast.error(mes, {
        position: 'top-right',
        autoClose: autoClose,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });
};
