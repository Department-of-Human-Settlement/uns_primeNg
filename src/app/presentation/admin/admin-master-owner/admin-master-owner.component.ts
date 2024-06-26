import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { OwnershipDataService } from 'src/app/core/services/ownership.dataservice';
import { AdminAddOwnerComponent } from '../shared/components/crud-modals/ownerships/admin-add-owner/admin-add-owner.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { OwnerDto } from 'src/app/core/models/ownership/owner.dto';
import { AdminEditOwnerComponent } from '../shared/components/crud-modals/ownerships/admin-edit-owner/admin-edit-owner.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Paginator, PaginatorModule } from 'primeng/paginator';

interface PageEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}
@Component({
  selector: 'app-admin-master-owner',
  standalone: true,
  imports: [TableModule, ButtonModule, ToastModule, ConfirmDialogModule, PaginatorModule],
  providers: [MessageService, DialogService, ConfirmationService],
  templateUrl: './admin-master-owner.component.html',
  styleUrl: './admin-master-owner.component.scss'
})

export class AdminMasterOwnerComponent implements OnInit {
  ref: DynamicDialogRef | undefined;
  constructor(
    private ownerDataService: OwnershipDataService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) { }

  firstPageNumber = 1;
  currentPage = 1;
  rows = 100;
  rowsPerPageOptions = 100;
  ownersPaginated: any;


  ngOnInit(): void {
    this.handlePagination();
  }

  addOwner() {
    this.ref = this.dialogService.open(AdminAddOwnerComponent, {
      width: 'max-content',
    });
    this.ref.onClose.subscribe((res) => {
      if (res.added) {
        this.messageService.add(
          {
            severity: 'success',
            summary: 'Added owner',
            detail: 'Added owner',
          }
        )
        this.handlePagination()
      }
    });
  }

  editOwner(owner) {
    this.ref = this.dialogService.open(AdminEditOwnerComponent, {

      header: 'Edit Owner data for cid: ' + owner.cid,
      data: {
        owner
      },
      width: 'max-content',
    });
    this.ref.onClose.subscribe((res) => {
      if (res.added) {
        this.messageService.add(
          {
            severity: 'success',
            summary: 'Added owner',
            detail: 'Added owner',
          }
        )
        this.handlePagination()
      }
    });
  }

  deleteOwner(id: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this record?',
      header: 'Delete Owner',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',

      accept: () => {
        this.ownerDataService.DeleteOwner(id).subscribe((res) => {
          if (res) {
            this.messageService.add({
              severity: 'info',
              summary: 'Deleted',
              detail: 'Record deleted',
            });
            this.handlePagination()
          }
        })
      },
      reject: () => { },
    });
  }

  onPageChange(event: PageEvent): void {
    this.firstPageNumber = event.first;
    this.currentPage = event.page + 1;
    this.rows = event.rows;
    this.handlePagination();
  }

  private handlePagination(): void {
    this.ownerDataService.GetAllOwnerPaginated(this.currentPage, this.rows)
      .subscribe((res: any) => {
        this.ownersPaginated = res;
      });
  }
}
