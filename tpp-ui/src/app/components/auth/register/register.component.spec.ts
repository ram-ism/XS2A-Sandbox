import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import {
  async,
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { InfoService } from '../../../commons/info/info.service';
import { InfoModule } from '../../../commons/info/info.module';
import { AuthService } from '../../../services/auth.service';
import { CertificateComponent } from '../certificate/certificate.component';
import { RegisterComponent } from './register.component';
import {
  TppIdStructure,
  TppIdType,
} from '../../../models/tpp-id-structure.model';
import JSZip from 'jszip';
import { CertGenerationService } from '../../../services/cert-generation.service';
import {CountryService} from '../../../services/country.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let registerFixture: ComponentFixture<RegisterComponent>;
  let authService: AuthService;
  let countryService: CountryService;
  let infoService: InfoService;
  let router: Router;
  let certGenerationService: CertGenerationService;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        InfoModule,
        FormsModule,
      ],
      providers: [AuthService, CountryService, InfoService, CertGenerationService],
      declarations: [RegisterComponent, CertificateComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    registerFixture = TestBed.createComponent(RegisterComponent);
    component = registerFixture.componentInstance;
    authService = TestBed.get(AuthService);
    infoService = TestBed.get(InfoService);
    countryService = TestBed.get(CountryService);
    certGenerationService = TestBed.get(CertGenerationService);
    router = TestBed.get(Router);
    de = registerFixture.debugElement.query(By.css('form'));
    el = de.nativeElement;
    registerFixture.detectChanges();

    component.selectedCountry = 'Germany';
    component.userForm.enable();
    component.tppIdStructure = testTppStructure;
  });

  const testTppStructure: TppIdStructure = {
    length: 8,
    type: TppIdType.n,
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('userForm should be invalid when at least one field is empty', () => {
    expect(component.userForm.valid).toBeFalsy();
  });

  it('TPP ID field validity', () => {
    component.changeIdValidators();
    const tppId = component.userForm.get('id');

    tppId.setValue('12345678');
    expect(tppId.valid).toBeTruthy();
    expect(tppId.errors).toBeNull();
  });

  it('login field validity', () => {
    let errors = {};
    const login = component.userForm.controls['login'];
    expect(login.valid).toBeFalsy();

    errors = login.errors || {};
    expect(errors['required']).toBeTruthy();

    login.setValue('test@test.de');
    errors = login.errors || {};
    expect(errors['required']).toBeFalsy();
  });

  it('email field validity', () => {
    const email = component.userForm.controls['email'];

    email.setValue('test@test.de');
    let errors = email.errors || {};
    expect(errors['email']).toBeFalsy();
  });

  it('pin field validity', () => {
    let errors = {};
    const pin = component.userForm.controls['pin'];
    expect(pin.valid).toBeFalsy();

    errors = pin.errors || {};
    expect(errors['required']).toBeTruthy();

    pin.setValue('12345678');
    errors = pin.errors || {};
    expect(errors['required']).toBeFalsy();
  });

  it(`Submit button should be enabled`, () => {
    component.userForm.controls['id'].setValue('12345678');
    component.userForm.controls['login'].setValue('test');
    component.userForm.controls['email'].setValue('asd@asd.com');
    component.userForm.controls['pin'].setValue('1234');

    registerFixture.detectChanges();
    el = registerFixture.debugElement.query(By.css('button')).nativeElement
      .disabled;
    expect(el).toBeFalsy();
  });

  it('should register and redirect user', () => {
    component.userForm.controls['id'].setValue('12345678');
    component.userForm.controls['login'].setValue('test');
    component.userForm.controls['email'].setValue('asd@asd.com');
    component.userForm.controls['pin'].setValue('1234');
    expect(component.generateCertificate).toBeFalsy();
    expect(component.userForm.valid).toBeTruthy();

    let registerSpy = spyOn(authService, 'register').and.callFake(() =>
      of({ value: 'sample response' })
    );
    let navigateSpy = spyOn(router, 'navigate').and.callFake(() =>
      Promise.resolve([])
    );
    component.onSubmit();
    expect(registerSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('on Submit should be invalid ', () => {
    component.onSubmit();
    expect(component.submitted).toEqual(true);
    expect(component.userForm.invalid).toBeTruthy();
  });

  it('should initialize a country List', () => {
    const mockData = [];
    const getCountryCodesSpy = spyOn(
      countryService,
      'getCountryCodes'
    ).and.returnValue(of({ mockData }));
    component.initializeCountryList();
    expect(getCountryCodesSpy).toHaveBeenCalled();
  });

  it('select Country should be disabled', () => {
    component.selectCountry();
    expect(component.userForm.disabled).toBeFalsy();
  });

  it('should select a country', () => {
    const data = {};
    component.userForm.get('id').setValue('123456');
    const getCountrySpy = spyOn(
      authService,
      'getTppIdStructure'
    ).and.returnValue(of({ data: data }));
    component.selectCountry();
    expect(getCountrySpy).toHaveBeenCalled();
  });

  it('should get tpp id type Name', () => {
    const testTppStructure: TppIdStructure = {
      length: 8,
      type: TppIdType.n,
    };
    component.getTppIdTypeName();
    expect(testTppStructure.length).toEqual(8);
  });

  it('should create a zip Url', (done) => {
    const encodedCert = 'encodedCert';
    const privateKey = 'privateKey';
    spyOn(component, 'generateZipFile').and.returnValue(of({}).toPromise());
    spyOn(component, 'createObjectUrl').and.returnValue('dummy-obj-val');
    component.createZipUrl(encodedCert, privateKey).then((r) => {
      expect(r).toBe('dummy-obj-val');
      done();
    });
  });

  it('createObjectUrl', () => {
    const zip = 'dummy-zip-content';
    const mockWindow = {
      URL: {
        createObjectURL: (param) => `url-string-object-${param}`,
      },
    };
    const result = component.createObjectUrl(zip, mockWindow);
    expect(result).toBe('url-string-object-dummy-zip-content');
  });

  it('should get certificate Value', () => {
    component.getCertificateValue('event');
    expect(component.certificateValue).toEqual('event');
  });

  it('should select a country and call a feedback message', () => {
    component.userForm.get('id').setValue('123456');
    const tppIdStructSpy = spyOn(
      authService,
      'getTppIdStructure'
    ).and.returnValue(throwError({}));
    const infoSpy = spyOn(infoService, 'openFeedback');
    component.selectCountry();
    expect(tppIdStructSpy).toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalledWith(
      'Could not get TPP ID structure for this country!'
    );
  });

  it('should initialize a country and call a feedback message when error', () => {
    const getCountryCodesSpy = spyOn(
      countryService,
      'getCountryCodes'
    ).and.returnValue(throwError({}));
    const infoSpy = spyOn(infoService, 'openFeedback');
    component.initializeCountryList();
    expect(getCountryCodesSpy).toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalledWith('Could not download country list!');
  });

  it('should generate a Zip file', (done) => {
    const certBlob = 'certBlob';
    const keyBlob = 'keyBlob';
    const mockZip: JSZip = ['Blob'];
    component.generateZipFile(certBlob, keyBlob).then((r: any) => {
      expect(r).toBeTruthy();
      done();
    });
  });

  it('should disabled the userform', () => {
    component.userForm.disable();
    const result = component.selectCountry();
    expect(result).toBeFalsy();
  });

  it('should call the on submit and call the url with message', fakeAsync(() => {
    const fakeUrl = 'http://fake.url';
    const message =
      'You have been successfully registered and your certificate generated. The download will start automatically within the 2 seconds';
    spyOn(authService, 'register').and.returnValue(of({}));
    spyOn(certGenerationService, 'generate').and.returnValue(
      of({ encodedCertencodedCert: 'endcode.cert', privateKey: 'private.key' })
    );
    spyOn(component, 'createZipUrl').and.returnValue(of(fakeUrl).toPromise());
    const navigationSpy = spyOn(component, 'navigateAndGiveFeedback');
    component.generateCertificate = true;
    component.certificateValue = {};
    component.userForm.controls['id'].setValue('12345678');
    component.userForm.controls['login'].setValue('test');
    component.userForm.controls['email'].setValue('asd@asd.com');
    component.userForm.controls['pin'].setValue('1234');
    component.onSubmit();
    tick(2000);
    expect(navigationSpy).toHaveBeenCalledWith(fakeUrl, message);
  }));
});
