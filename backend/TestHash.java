import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println(encoder.matches("password", "$2a$10$wY1twTgHXPT2b.9R/u7.8.G.J3X8Nl5.P29C.t0O4L.Q5t2F2w1.e"));
    }
}
