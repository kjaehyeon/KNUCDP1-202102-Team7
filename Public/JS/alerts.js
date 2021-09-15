function reAlert(text, callback) {
    Swal.fire({
        title: 'Are you sure?',
        html: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2A9EDD',
        cancelButtonColor: '#66687A',
        confirmButtonText: 'OK'
    }).then((result) => {
        if (result.isConfirmed) {
            callback();
        }
    });
}

function inputAlert(text, callback) {
    Swal.fire({
        title: 'Are you sure?',
        input: 'textarea',
        icon: 'warning',
        inputLabel: text,
        inputPlaceholder: 'Type your message here...',
        inputAttributes: { autocapitalize: 'off' },
        showCancelButton: true,
        confirmButtonColor: '#2A9EDD',
        cancelButtonColor: '#66687A',
        confirmButtonText: 'OK',
        showLoaderOnConfirm: true,
        preConfirm: callback
    });
}

function rejectedAlert(title, text, callback) {
    Swal.fire({
        title: title,
        html: `<b>Reason:</b><br>${text}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#FFBE55',
        cancelButtonColor: '#66687A',
        confirmButtonText: 'Delete'
    }).then((result) => {
        if (result.isConfirmed) {
            callback();
        }
    });
}

function resultAlert(title) {
    Swal.fire({
        title: title,
        icon: 'success'
    }).then(() => location.reload());
}

function errorAlert() {
    Swal.fire({
        title: 'Error',
        text: 'An error has occurred.',
        icon: 'error'
    }).then(() => location.reload());
}
