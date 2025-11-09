document.addEventListener('DOMContentLoaded', function() {
    // Находим все блоки загрузки файлов на странице
    const uploadFields = document.querySelectorAll('.js-field-file-multiple');
    
    uploadFields.forEach(uploadField => {
        const fileInput = uploadField.querySelector('.js-field-input');
        const attachButton = uploadField.querySelector('.js-file-button-attach');
        
        // Хранилище для файлов этого инпута
        let currentFiles = [];
        
        // Обработчик клика на кнопку "Выбрать файлы"
        attachButton.addEventListener('click', function(e) {
            e.preventDefault();
            fileInput.click();
        });
        
        // Обработчик изменения input file
        fileInput.addEventListener('change', function() {
            handleFiles(this.files, uploadField, fileInput);
        });
        
        // Обработчик drag and drop
        setupDragAndDrop(uploadField, fileInput);
    });
    
    // Обработчик удаления файлов (делегирование событий)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('button-file-del')) {
            e.preventDefault();
            const fileItem = e.target.closest('.frm-field-file');
            if (fileItem) {
                removeFileItem(fileItem);
            }
        }
    });
});

// Функция для обработки выбранных файлов
function handleFiles(files, uploadField, fileInput) {
    if (!files.length) return;
    
    // Создаем контейнер для файлов, если его еще нет
    let filesContainer = uploadField.nextElementSibling;
    if (!filesContainer || !filesContainer.classList.contains('uploaded-files-container')) {
        filesContainer = document.createElement('div');
        filesContainer.className = 'uploaded-files-container';
        uploadField.parentNode.insertBefore(filesContainer, uploadField.nextSibling);
    }
    
    // Добавляем каждый файл
    Array.from(files).forEach(file => {
        addFileItem(file, filesContainer, fileInput);
    });
    
    // Очищаем input (но файлы сохраняются в DataTransfer)
    fileInput.value = '';
}

// Функция для добавления элемента файла
function addFileItem(file, container, fileInput) {
    const fileSize = formatFileSize(file.size);
    const fileId = generateFileId();
    
    const fileItem = document.createElement('div');
    fileItem.className = 'frm-field';
    fileItem.setAttribute('data-file-id', fileId);
    fileItem.innerHTML = `
        <div class="frm-field-file type-att file-active">
            <div class="file-inner-wrap">
                <div class="file-name">${file.name} ${fileSize}</div>
                <a href="#" class="btn-action-ico ico-trash button-file-del"></a>
            </div>
        </div>
    `;
    
    container.appendChild(fileItem);
    
    // Сохраняем файл в input
    addFileToInput(file, fileInput, fileId);
}

// Функция для удаления элемента файла
function removeFileItem(fileItem) {
    const fileField = fileItem.closest('.frm-field');
    const fileId = fileField.getAttribute('data-file-id');
    const uploadField = fileField.parentElement.previousElementSibling;
    const fileInput = uploadField.querySelector('.js-field-input');
    
    // Удаляем файл из input
    removeFileFromInput(fileId, fileInput);
    
    // Удаляем визуальный элемент
    fileField.remove();
    
    // Если контейнер пуст, удаляем его
    const filesContainer = fileField.parentElement;
    if (filesContainer.children.length === 0) {
        filesContainer.remove();
    }
}

// Функция для добавления файла в input
function addFileToInput(file, fileInput, fileId) {
    // Получаем текущий DataTransfer
    const dataTransfer = new DataTransfer();
    
    // Добавляем существующие файлы
    const currentFiles = Array.from(fileInput.files || []);
    currentFiles.forEach(existingFile => {
        dataTransfer.items.add(existingFile);
    });
    
    // Добавляем новый файл
    dataTransfer.items.add(file);
    
    // Сохраняем файл в кастомном хранилище
    if (!fileInput._fileStorage) {
        fileInput._fileStorage = new Map();
    }
    fileInput._fileStorage.set(fileId, file);
    
    // Обновляем files в input
    fileInput.files = dataTransfer.files;
    
    console.log('Файлы в input:', fileInput.files.length);
}

// Функция для удаления файла из input
function removeFileFromInput(fileId, fileInput) {
    const dataTransfer = new DataTransfer();
    
    // Удаляем из кастомного хранилища
    if (fileInput._fileStorage) {
        fileInput._fileStorage.delete(fileId);
    }
    
    // Пересоздаем FileList из оставшихся файлов
    if (fileInput._fileStorage) {
        fileInput._fileStorage.forEach(file => {
            dataTransfer.items.add(file);
        });
    }
    
    // Обновляем files в input
    fileInput.files = dataTransfer.files;
    
    console.log('Файлы в input после удаления:', fileInput.files.length);
}

// Функция для генерации уникального ID файла
function generateFileId() {
    return 'file_' + Math.random().toString(36).substr(2, 9);
}

// Функция для форматирования размера файла
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Б';
    
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Функция для настройки drag and drop
function setupDragAndDrop(uploadField, fileInput) {
    // Предотвращаем стандартное поведение браузера
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadField.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Подсветка области при перетаскивании
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadField.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadField.addEventListener(eventName, unhighlight, false);
    });
    
    // Обработка drop
    uploadField.addEventListener('drop', function(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files, uploadField, fileInput);
    }, false);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight() {
        uploadField.classList.add('highlight');
    }
    
    function unhighlight() {
        uploadField.classList.remove('highlight');
    }
}