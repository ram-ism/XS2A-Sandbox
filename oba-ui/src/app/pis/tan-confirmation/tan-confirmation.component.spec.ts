import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutingPath } from '../../common/models/routing-path.model';
import { ShareDataService } from '../../common/services/share-data.service';
import { PaymentDetailsComponent } from '../payment-details/payment-details.component';
import { TanConfirmationComponent } from './tan-confirmation.component';
import AuthorisePaymentUsingPOSTParams = PSUPISCancellationProvidesAccessToOnlineBankingPaymentFunctionalityService.AuthorisePaymentUsingPOSTParams;
import {PSUPISCancellationProvidesAccessToOnlineBankingPaymentFunctionalityService} from "../../api/services/psupiscancellation-provides-access-to-online-banking-payment-functionality.service";
import { PisService } from '../../common/services/pis.service';

import { of, throwError } from 'rxjs';
import get = Reflect.get;

const mockRouter = {
    navigate: (url: string) => {
    }
};

const mockActivatedRoute = {
    params: of({id: '12345'})
};

describe('TanConfirmationComponent', () => {
  let component: TanConfirmationComponent;
  let fixture: ComponentFixture<TanConfirmationComponent>;
  let shareDataService: ShareDataService;
  let pisService: PisService;
  let router: Router;
  let route: ActivatedRoute;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, ReactiveFormsModule],
      declarations: [TanConfirmationComponent, PaymentDetailsComponent],
        providers: [ShareDataService, PisService,
            {provide: Router, useValue: mockRouter},
            {provide: ActivatedRoute, useValue: mockActivatedRoute}]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TanConfirmationComponent);
    component = fixture.componentInstance;
      shareDataService = TestBed.get(ShareDataService);
      pisService = TestBed.get(PisService);
      router = TestBed.get(Router);
      route = TestBed.get(ActivatedRoute);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

    it('should call the on submit', () => {
        let mockResponse = {
            encryptedPaymentId:'owirhJHGVSgueif98200293uwpgofowbOUIGb39845zt0',
            authorisationId: 'uwpgofowbOUIGb39845zt0owirhJHGVSgueif98200293',
        }
        component.authResponse = mockResponse;
        component.tanForm.get('authCode').setValue('izsugfHZVblizdwru79348z0');
        let pisAuthSpy = spyOn(pisService, 'authorizePayment').and.returnValue(of(mockResponse));
        let navigateSpy = spyOn(router, 'navigate').and.returnValue(of(undefined).toPromise());
        component.onSubmit();
        expect(navigateSpy).toHaveBeenCalledWith([`${RoutingPath.PAYMENT_INITIATION}/${RoutingPath.RESULT}`],
            {queryParams: { encryptedConsentId:undefined,
                    authorisationId: 'uwpgofowbOUIGb39845zt0owirhJHGVSgueif98200293', oauth2: null}});
        expect(pisAuthSpy).toHaveBeenCalled();
    });

    it('should call the on submit and return to result page when you set a wrong TAN', () => {
        let mockResponse = {
            encryptedConsentId:'owirhJHGVSgueif98200293uwpgofowbOUIGb39845zt0',
            authorisationId: 'uwpgofowbOUIGb39845zt0owirhJHGVSgueif98200293'
        }
        component.authResponse = mockResponse;
        component.tanForm.get('authCode').setValue('izsugfHZVblizdwru79348z0fHZVblizdwru793');
        component.invalidTanCount = 3;
        let pisAuthSpy = spyOn(pisService, 'authorizePayment').and.returnValue(throwError(mockResponse));
        let navigateSpy = spyOn(router, 'navigate').and.returnValue(of(undefined).toPromise());
        component.onSubmit();
        expect(navigateSpy).toHaveBeenCalledWith([`${RoutingPath.PAYMENT_INITIATION}/${RoutingPath.RESULT}`],
            {queryParams: { encryptedConsentId:'owirhJHGVSgueif98200293uwpgofowbOUIGb39845zt0',
                    authorisationId: 'uwpgofowbOUIGb39845zt0owirhJHGVSgueif98200293', oauth2: null}});
        expect(pisAuthSpy).toHaveBeenCalled();
    });

    it('should cancel and redirect to result page', () => {
        let mockResponse = {
            encryptedConsentId:'owirhJHGVSgueif98200293uwpgofowbOUIGb39845zt0',
            authorisationId: 'uwpgofowbOUIGb39845zt0owirhJHGVSgueif98200293'
        }
        component.authResponse = mockResponse;
        let navigateSpy = spyOn(router, 'navigate');
        component.onCancel();
        expect(navigateSpy).toHaveBeenCalledWith([`${RoutingPath.PAYMENT_INITIATION}/${RoutingPath.RESULT}`],
            {queryParams: { encryptedConsentId:'owirhJHGVSgueif98200293uwpgofowbOUIGb39845zt0',
                    authorisationId: 'uwpgofowbOUIGb39845zt0owirhJHGVSgueif98200293'}});
    });
});
