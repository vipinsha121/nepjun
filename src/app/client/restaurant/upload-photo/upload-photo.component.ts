import { Component, OnInit } from '@angular/core';
import { ViewCell, Cell, DefaultEditor, Editor } from 'ng2-smart-table';
import { FileUploader } from 'ng2-file-upload';

@Component({
  selector: 'upload-photo',
  templateUrl: './upload-photo.component.html',
  styleUrls: ['./upload-photo.component.scss']
})
export class UploadPhotoComponent extends DefaultEditor implements OnInit {

  showPhoto = false;
  photo: string;
  uploader: FileUploader;

  constructor() {
    super();
  }

  ngOnInit() {
    this.uploader = new FileUploader({
      url: `https://api.paranoidfan.com/api/sdk/upload`,
      isHTML5: true,
      headers: [{
          name: 'Authkey',
          value: 'NCta}*XTV1R6SCta}*XTV1R0'
      }]
    });
  }

  uploadPhoto(event) {
    // document.getElementById('restaurant-img').setAttribute('src', URL.createObjectURL(event.target.files[0]));
    const _that = this;

    this.uploader.onCompleteItem = function (item, response, status, headers) {
      // console.log(item)
      console.log(status)
      if (status === 200) {
          const res = JSON.parse(response);
          if (item.alias === 'photo') {
            _that.photo = res.URL;
            _that.showPhoto = true;
            _that.cell.newValue = _that.photo;
          }
          // console.log(item, res, status);
      } else {
          item.upload();
      }
    };

    if (this.uploader.queue.length > 0) {
      this.uploader.queue.forEach(item => {
          if (item.file.type.match(/image/)) {
              item.alias = 'photo';
              this.uploader.onBuildItemForm = (item, form) => {
                  form.append('path', 'uploads/');
              };
              item.upload();
          }
      });
    }
  }

}

// Custom Editor Component example:
// https://github.com/akveo/ng2-smart-table/blob/master/src/app/pages/examples/custom-edit-view/advanced-example-custom-editor.component.ts
