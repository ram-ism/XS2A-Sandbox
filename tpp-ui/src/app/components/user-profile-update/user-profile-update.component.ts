import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { TppUserService } from '../../services/tpp.user.service';
import { TppManagementService } from '../../services/tpp-management.service';

@Component({
  selector: 'app-user-profile-update',
  templateUrl: './user-profile-update.component.html',
  styleUrls: ['./user-profile-update.component.scss'],
})
export class UserProfileUpdateComponent implements OnInit {
  user: User;
  userForm: FormGroup;
  submitted: boolean;
  admin: boolean;

  constructor(
    private authService: AuthService,
    private userInfoService: TppUserService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private tppManagementService: TppManagementService,
    private router: Router
  ) {}

  ngOnInit() {
    this.setupEditUserFormControl();
    this.getUserDetails();

    const tppId = this.route.snapshot.params['id'];
    if (tppId) {
      this.getUserInfoForAdmin(tppId);
    }
  }

  get formControl() {
    return this.userForm.controls;
  }

  getUserDetails(): void {
    if (this.authService.isLoggedIn()) {
      this.userInfoService.getUserInfo().subscribe((user: User) => {
        this.user = user;

        this.userForm.patchValue({
          email: this.user.email,
          username: this.user.login,
        });
      });
    }
  }

  setupEditUserFormControl(): void {
    this.userForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.email, Validators.required]],
      password: ['', Validators.minLength(5)],
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.userForm.invalid) {
      return;
    }
    const updatedUser: User = {
      ...this.user,
      email: this.userForm.get('email').value,
      login: this.userForm.get('username').value,
      pin: this.userForm.get('password').value.trim()
        ? this.userForm.get('password').value
        : this.user.pin,
    };

    this.userInfoService
      .updateUserInfo(updatedUser)
      .subscribe(() => this.router.navigate(['/profile']));

    if (this.admin === true) {
      this.tppManagementService
        .updateUserDetails(updatedUser)
        .subscribe(() => this.router.navigate(['/users/all']));
    } else if (this.admin === false) {
      this.userInfoService
        .updateUserInfo(updatedUser)
        .subscribe(() => this.router.navigate(['/profile']));
    }
  }

  private getUserInfoForAdmin(tppId: string) {
    this.tppManagementService.getTppById(tppId).subscribe((user: User) => {
      if (user) {
        this.user = user;
        this.admin = true;
        this.userForm.patchValue({
          email: this.user.email,
          username: this.user.login,
        });
      }
    });
  }
}
