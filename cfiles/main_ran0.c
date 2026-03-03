#include <stdio.h>
#include <math.h>
#include "/home/ghost/intellectual/c/nr/nrc.h"

int main(void) {

	long idum = 1;

	for (int i = 0; i < 10; i++) {
		printf("%f\n", nrc_ran0(&idum));
	}

	return 0;
}