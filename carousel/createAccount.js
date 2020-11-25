function revealBusiness()
{
    let form = document.getElementById("accounts");
    form.innerHTML = "<input type=\"radio\" id=\"business\" name=\"account\" value=\"Business\" checked=\"true\" onclick=\"revealBusiness()\">"+
            "<label for=\"business\">Business Account</label>"+
            "<input type=\"radio\" id=\"standard\" name=\"account\" value=\"Standard\" onclick=\"revealStandard()\">"+
            "<label for=\"standard\">Standard Account</label>"+
            "<p></p>"+
            "<label for=\"fname\"><b>First Name:</b></label>"+
            "<p></p>"+
            "<input type=\"text\" placeholder=\"Enter First name\" name=\"fname\" required>"+
            "<p></p>"+
            "<label for=\"lname\"><b>Last Name:</b></label>"+
            "<p></p>"+
            "<input type=\"text\" placeholder=\"Enter Last name\" name=\"lname\" required>"+
            "<p></p>"+
            "<label for=\"Bname\"><b>Business Name:</b></label>"+
            "<p></p>"+
            "<input type=\"text\" placeholder=\"Enter Business name\" name=\"Bname\" required>"+
            "<p></p>"+
            "<label for=\"email\"><b>Business Email:</b></label>"+
            "<p></p>"+
            "<input type=\"email\" placeholder=\"Enter email adress\" name=\"email\" required>"+
            "<p></p>"+
            "<label for=\"uname\"><b>Username:</b></label>"+
            "<p></p>"+
            "<input type=\"text\" placeholder=\"Enter Username\" name=\"uname\" required>"+
            "<p></p>"+
            "<label for=\"psw\"><b>Password:</b></label>"+
            "<p></p>"+
            "<input type=\"password\" placeholder=\"Enter Password\" name=\"psw\" required>"+
            "<p></p>"+
            "<a href=\"index.html\">Back</a>"+
            "<button type=\"submit\">Create Business Account</button>";



}

function revealStandard()
{
    let form = document.getElementById("accounts");
    form.innerHTML="<input type=\"radio\" id=\"business\" name=\"account\" value=\"Business\" onclick=\"revealBusiness()\">"+
            "<label for=\"business\">Business Account</label>"+
            "<input type=\"radio\" id=\"standard\" name=\"account\" value=\"Standard\" checked=\"true\" onclick=\"revealStandard()\">"+
            "<label for=\"standard\">Standard Account</label>"+
            "<p></p>"+
            "<label for=\"fname\"><b>First Name:</b></label>"+
            "<p></p>"+
            "<input type=\"text\" placeholder=\"Enter First name\" name=\"fname\" required>"+
            "<p></p>"+
            "<label for=\"lname\"><b>Last Name:</b></label>"+
            "<p></p>"+
            "<input type=\"text\" placeholder=\"Enter Last name\" name=\"lname\" required>"+
            "<p></p>"+
            "<label for=\"email\"><b>Email:</b></label>"+
            "<p></p>"+
            "<input type=\"email\" placeholder=\"Enter email adress\" name=\"email\" required>"+
            "<p></p>"+
            "<label for=\"uname\"><b>Username:</b></label>"+
            "<p></p>"+
            "<input type=\"text\" placeholder=\"Enter Username\" name=\"uname\" required>"+
            "<p></p>"+
            "<label for=\"psw\"><b>Password:</b></label>"+
            "<p></p>"+
            "<input type=\"password\" placeholder=\"Enter Password\" name=\"psw\" required>"+
            "<p></p>"+
            "<a href=\"index.html\">Back</a>"+
            "<button type=\"submit\">Create Business Account</button>";
}

