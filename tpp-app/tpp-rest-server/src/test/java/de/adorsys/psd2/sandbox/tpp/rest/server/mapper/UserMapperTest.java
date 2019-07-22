package de.adorsys.psd2.sandbox.tpp.rest.server.mapper;

import de.adorsys.ledgers.middleware.api.domain.um.UserRoleTO;
import de.adorsys.ledgers.middleware.api.domain.um.UserTO;
import de.adorsys.psd2.sandbox.tpp.rest.api.domain.*;
import org.junit.Assert;
import org.junit.Test;
import org.mapstruct.factory.Mappers;

import java.util.Arrays;
import java.util.Objects;

public class UserMapperTest {
    private final UserMapper userMapper = Mappers.getMapper(UserMapper.class);

    @Test
    public void ttpInfoToUserTOTest() {
        TppInfo tppInfo = new TppInfo();
        tppInfo.setEmail("vne@adorsys.de");
        tppInfo.setLogin("vne");
        tppInfo.setPin("12345");
        tppInfo.setId("12345678");

        UserTO user = userMapper.ttpInfoToUserTO(tppInfo);

        Assert.assertEquals(user.getEmail(), tppInfo.getEmail());
        Assert.assertEquals(user.getLogin(), tppInfo.getLogin());
        Assert.assertEquals(user.getPin(), tppInfo.getPin());
    }

    @Test
    public void toUserTO() {
        User user = new User();
        user.setEmail("vne@adorsys.de");
        user.setLogin("vne");
        user.setPin("12345");

        // SCA EMAIL
        ScaUserData scaEmail = new ScaUserData();
        scaEmail.setMethodValue("vne@adorsys.de");
        scaEmail.setScaMethod(ScaMethodType.EMAIL);

        // SCA Mobile
        ScaUserData scaMobile = new ScaUserData();
        scaMobile.setScaMethod(ScaMethodType.MOBILE);
        scaMobile.setMethodValue("0123456789");

        user.setScaUserData(Arrays.asList(scaEmail, scaMobile));

        // Assign all roles to the user
        user.setUserRoles(Arrays.asList(UserRole.CUSTOMER, UserRole.STAFF, UserRole.TECHNICAL, UserRole.SYSTEM));

        UserTO userTO = userMapper.toUserTO(user);

        Assert.assertEquals(userTO.getEmail(), user.getEmail());
        Assert.assertEquals(userTO.getLogin(), user.getLogin());
        Assert.assertEquals(userTO.getPin(), user.getPin());
        Assert.assertEquals(userTO.getScaUserData().size(), user.getScaUserData().size());
        Assert.assertEquals(userTO.getUserRoles().size(), user.getUserRoles().size());


        for (int i = 0; i < userTO.getAccountAccesses().size(); i++)
        {
            Assert.assertEquals(userTO.getScaUserData().get(i).getMethodValue(), user.getScaUserData().get(i).getMethodValue());
            Assert.assertEquals(userTO.getScaUserData().get(i).getScaMethod().toString(), user.getScaUserData().get(i).getScaMethod().toString());
        }

        int i = 0;
        for (UserRoleTO role: userTO.getUserRoles())
        {
            Assert.assertEquals(role.toString(), user.getUserRoles().get(i).toString());
            i++;
        }

    }
}
