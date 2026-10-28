import Swal from 'sweetalert2';

export default function mostrarSucesso(opcoes) {
  const { didOpen, ...configuracao } = opcoes;

  return Swal.fire({
    ...configuracao,
    icon: 'success',
    showConfirmButton: true,
    confirmButtonText: 'OK',
    timer: 3000,
    timerProgressBar: true,
    didOpen: (popup) => {
      didOpen?.(popup);
    },
  });
}