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
    createInfo: function (content, position = 'top-right') {
        let wrapper = document.createElement('div');
        addClassEl('info-wrapper', wrapper);

        let infoIcon = document.createElement('div');
        infoIcon.className = 'info-icon';

        infoIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 458.6667 458.6667">
            <path d="M245.3333,208c0-8.8363-7.1637-16-16-16s-16,7.1637-16,16v128c0,8.8363,7.1637,16,16,16s16-7.1637,16-16v-128Z"/>
            <path d="M229.3333,0C102.6761,0,0,102.6761,0,229.3333s102.6761,229.3333,229.3333,229.3333,229.3333-102.6752,229.3333-229.3333S355.9915,0,229.3333,0ZM32,229.3333c0-108.9841,88.3492-197.3333,197.3333-197.3333s197.3333,88.3492,197.3333,197.3333-88.3499,197.3333-197.3333,197.3333S32,338.3168,32,229.3333Z"/>
            <path d="M250.6667,144c0,11.782-9.5509,21.3333-21.3333,21.3333s-21.3333-9.5514-21.3333-21.3333,9.5509-21.3333,21.3333-21.3333,21.3333,9.5514,21.3333,21.3333Z"/>
        </svg>`;

        const contentEl = document.createElement('div');
        contentEl.className = `info-content ${position}`;
        contentEl.innerHTML = content;

        wrapper.appendChild(infoIcon);
        wrapper.appendChild(contentEl);

        let isVisible = false;

        const showModal = () => {
            contentEl.style.opacity = '1';
            contentEl.style.visibility = 'visible';
            isVisible = true;
        };

        const hideModal = () => {
            contentEl.style.opacity = '0';
            contentEl.style.visibility = 'hidden';
            isVisible = false;
        };

        infoIcon.addEventListener('click', (e) => {
            e.stopPropagation();

            if (isVisible) {
                hideModal();
            } else {
                showModal();
            }
        });

        document.addEventListener('click', (e) => {
            if (isVisible) {
                e.preventDefault();
                e.stopPropagation();

                hideModal();
            }
        });

        contentEl.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        return wrapper;
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