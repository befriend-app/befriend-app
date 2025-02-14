befriend.modals = {
    ids: {
        images: 'person-image-modal'
    },
    images: {
        openModal: function(imageUrl) {
            let modal_el = document.getElementById(befriend.modals.ids.images);
            let modal_image_el = modal_el.querySelector('img');
            modal_image_el.src = imageUrl;

            addClassEl('active', modal_el);
            document.body.style.overflow = 'hidden';
        },
        closeModal: function() {
            let modal_el = document.getElementById(befriend.modals.ids.images);
            removeClassEl('active', modal_el);
            document.body.style.overflow = '';
        },
    },
    events: {
        init: function () {
            this.onImageModal();
        },
        onImageModal: function () {
            let modal_el = document.getElementById(befriend.modals.ids.images);

            if(modal_el._listener) {
                return;
            }

            modal_el._listener = true;

            let modal_image_el = modal_el.querySelector('img');

            modal_el.addEventListener('click', (e) => {
                befriend.modals.images.closeModal();
            });

            modal_image_el.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        },
    }
}